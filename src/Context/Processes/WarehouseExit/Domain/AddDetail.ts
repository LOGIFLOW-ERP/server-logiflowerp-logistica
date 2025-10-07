import { BadRequestException, UnprocessableEntityException } from '@Config/exception'
import {
    collections,
    CreateWarehouseExitDetailDTO,
    OrderDetailENTITY,
    ProductPriceENTITY,
    StateWarehouseStock,
    validateCustom,
    WarehouseExitENTITY,
    WarehouseStockENTITY
} from 'logiflowerp-sdk'
import { IWarehouseExitMongoRepository } from './IMongoRepository'

export class AddDetail {
    protected document!: WarehouseExitENTITY
    protected msgExistDetail: string = 'Ya existe un detalle con el mismo keyDetail' // Se usa en reposición automatica

    constructor(protected readonly repository: IWarehouseExitMongoRepository) { }

    async buildDetail(
        document: WarehouseExitENTITY,
        dto: CreateWarehouseExitDetailDTO
    ) {
        this.document = document
        const productPrice = await this.searchProductPrice(dto)
        const newDetail = await this._buildDetail(dto, productPrice)
        await this.searchWarehouseStock(newDetail)
        await this.validateAvailableStockWarehouse(dto.warehouseStock._id, newDetail)
        this.validateDetail(newDetail) // importante que se llame este metodo aqui antes de retornar haga esta validacion
        return newDetail
    }

    private searchProductPrice(dto: CreateWarehouseExitDetailDTO) {
        const pipeline = [{ $match: { itemCode: dto.warehouseStock.item.itemCode, isDeleted: false } }]
        return this.repository.selectOne<ProductPriceENTITY>(pipeline, collections.productPrice)
    }

    private validateDetail(newDetail: OrderDetailENTITY) {
        if (newDetail.amount <= 0) {
            throw new UnprocessableEntityException(`La cantidad del detalle debe ser mayor a cero.`, true)
        }
        if (this.document.detail.some(item => item.keyDetail === newDetail.keyDetail)) {
            throw new BadRequestException(this.msgExistDetail, true) // importante que el mensaje de error empiece por this.msgExistDetail
        }
    }

    private _buildDetail(dto: CreateWarehouseExitDetailDTO, productPrice: ProductPriceENTITY) {
        const lastPosition = this.document.detail.reduce((acc, item) => Math.max(acc, item.position), 0)
        const detail = new OrderDetailENTITY()
        detail.set(dto.warehouseStock)
        detail.amount = dto.amount
        detail.codeStore = this.document.store.code
        detail.position = lastPosition + 1
        detail.price = productPrice
        return validateCustom(detail, OrderDetailENTITY, UnprocessableEntityException)
    }

    private async searchWarehouseStock(newDetail: OrderDetailENTITY) {
        const pipeline = [{
            $match: {
                keySearch: newDetail.keySearch,
                keyDetail: newDetail.keyDetail,
                'store.code': this.document.store.code,
                isDeleted: false
            }
        }]
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