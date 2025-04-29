import { IWarehouseExitMongoRepository } from '../Domain'
import {
    CreateWarehouseExitDetail,
    OrderDetailENTITY,
    ProductPriceENTITY,
    StateOrder,
    StateWarehouseStock,
    WarehouseExitENTITY,
    WarehouseStockENTITY,
    collections,
    validateCustom
} from 'logiflowerp-sdk'
import {
    BadRequestException,
    UnprocessableEntityException
} from '@Config/exception'
import { WAREHOUSE_EXIT_TYPES } from '../Infrastructure/IoC'
import { inject, injectable } from 'inversify'

@injectable()
export class UseCaseAddDetail {

    private document!: WarehouseExitENTITY

    constructor(
        @inject(WAREHOUSE_EXIT_TYPES.RepositoryMongo) private readonly repository: IWarehouseExitMongoRepository,
    ) { }

    async exec(_id: string, dto: CreateWarehouseExitDetail) {
        await this.searchDocument(_id)
        const productPrice = await this.searchProductPrice(dto)
        const newDetail = await this.buildDetail(dto, productPrice)
        this.validateDetail(newDetail)
        await this.searchWarehouseStock(newDetail)
        await this.validateAvailableStockWarehouse(dto.warehouseStock._id, newDetail)
        return this.repository.updateOne({ _id }, { $push: { detail: newDetail } })
    }

    private async searchDocument(_id: string) {
        const pipeline = [{ $match: { _id, state: { $ne: StateOrder.VALIDADO } } }]
        this.document = await this.repository.selectOne(pipeline)
    }

    private searchProductPrice(dto: CreateWarehouseExitDetail) {
        const pipeline = [{ $match: { itemCode: dto.warehouseStock.item.itemCode } }]
        return this.repository.selectOne<ProductPriceENTITY>(pipeline, collections.productPrice)
    }

    private validateDetail(newDetail: OrderDetailENTITY) {
        if (newDetail.amount <= 0) {
            throw new UnprocessableEntityException(`La cantidad del detalle debe ser mayor a cero.`, true)
        }
        if (this.document.detail.some(item => item.keyDetail === newDetail.keyDetail)) {
            throw new BadRequestException('Ya existe un detalle con el mismo keyDetail', true)
        }
    }

    private buildDetail(dto: CreateWarehouseExitDetail, productPrice: ProductPriceENTITY) {
        const lastPosition = this.document.detail.reduce((acc, item) => Math.max(acc, item.position), 0)
        const detail = new OrderDetailENTITY()
        detail.set(dto.warehouseStock)
        detail.amount = dto.amount
        detail.codeStore = dto.warehouseStock.store.code
        detail.position = lastPosition + 1
        detail.price = productPrice
        return validateCustom(detail, OrderDetailENTITY, UnprocessableEntityException)
    }

    private async searchWarehouseStock(newDetail: OrderDetailENTITY) {
        const pipeline = [{ $match: { keySearch: newDetail.keySearch, keyDetail: newDetail.keyDetail } }]
        const warehouseStock = await this.repository.selectOne<WarehouseStockENTITY>(pipeline, collections.warehouseStock)
        if (warehouseStock.state !== StateWarehouseStock.ACTIVO) {
            throw new BadRequestException(
                `El estado del stock almacén ${warehouseStock.keyDetail} es ${warehouseStock.state}. No se puede realizar la acción.`,
                true
            )
        }
    }

    private async validateAvailableStockWarehouse(_id: string, newDetail: OrderDetailENTITY) {
        const result = await this.repository.validateAvailableWarehouseStocks({ _ids: [_id] })
        if (newDetail.amount > result[0].available) {
            throw new BadRequestException(
                `La cantidad solicitada (${newDetail.amount}) excede el stock disponible (${result[0].available}).`,
                true
            )
        }
    }

}