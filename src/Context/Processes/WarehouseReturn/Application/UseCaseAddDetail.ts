import { IWarehouseReturnMongoRepository } from '../Domain'
import {
    CreateWarehouseReturnDetailDTO,
    EmployeeStockENTITY,
    OrderDetailENTITY,
    ProductPriceENTITY,
    State,
    StateOrder,
    WarehouseReturnENTITY,
    collections,
    validateCustom
} from 'logiflowerp-sdk'
import {
    BadRequestException,
    UnprocessableEntityException
} from '@Config/exception'
import { WAREHOUSE_RETURN_TYPES } from '../Infrastructure/IoC'
import { inject, injectable } from 'inversify'

@injectable()
export class UseCaseAddDetail {

    private document!: WarehouseReturnENTITY

    constructor(
        @inject(WAREHOUSE_RETURN_TYPES.RepositoryMongo) private readonly repository: IWarehouseReturnMongoRepository,
    ) { }

    async exec(_id: string, dto: CreateWarehouseReturnDetailDTO) {
        await this.searchDocument(_id)
        const productPrice = await this.searchProductPrice(dto)
        const newDetail = await this.buildDetail(dto, productPrice)
        this.validateDetail(newDetail)
        await this.searchEmployeeStock(newDetail)
        await this.validateAvailableStockEmployee(dto.employeeStock._id, newDetail)
        return this.repository.updateOne({ _id }, { $push: { detail: newDetail } })
    }

    private async searchDocument(_id: string) {
        const pipeline = [{ $match: { _id, state: { $ne: StateOrder.VALIDADO } } }]
        this.document = await this.repository.selectOne(pipeline)
    }

    private searchProductPrice(dto: CreateWarehouseReturnDetailDTO) {
        const pipeline = [{ $match: { itemCode: dto.employeeStock.item.itemCode, isDeleted: false } }]
        return this.repository.selectOne<ProductPriceENTITY>(pipeline, collections.productPrice)
    }

    private buildDetail(dto: CreateWarehouseReturnDetailDTO, productPrice: ProductPriceENTITY) {
        const lastPosition = this.document.detail.reduce((acc, item) => Math.max(acc, item.position), 0)
        const detail = new OrderDetailENTITY()
        detail.set(dto.employeeStock)
        detail.amount = dto.amount
        detail.codeStore = this.document.store.code
        detail.position = lastPosition + 1
        detail.price = productPrice
        return validateCustom(detail, OrderDetailENTITY, UnprocessableEntityException)
    }

    private validateDetail(newDetail: OrderDetailENTITY) {
        if (newDetail.amount <= 0) {
            throw new UnprocessableEntityException(`La cantidad del detalle debe ser mayor a cero.`, true)
        }
        if (this.document.detail.some(item => item.keyDetail === newDetail.keyDetail)) {
            throw new BadRequestException('Ya existe un detalle con el mismo keyDetail', true)
        }
    }

    private async searchEmployeeStock(newDetail: OrderDetailENTITY) {
        const pipeline = [{
            $match: {
                keySearch: newDetail.keySearch,
                keyDetail: newDetail.keyDetail,
                'employee.identity': this.document.carrier.identity,
                'store.code': this.document.store.code
            }
        }]
        const employeeStock = await this.repository.selectOne<EmployeeStockENTITY>(pipeline, collections.employeeStock)
        if (employeeStock.state !== State.ACTIVO) {
            throw new BadRequestException(
                `El estado del stock ${employeeStock.keyDetail} es ${employeeStock.state}. No se puede realizar la acción.`,
                true
            )
        }
    }

    private async validateAvailableStockEmployee(_id: string, newDetail: OrderDetailENTITY) {
        const result = await this.repository.validateAvailableEmployeeStocks({ _ids: [_id] })
        if (newDetail.amount > result[0].available) {
            throw new BadRequestException(
                `La cantidad a devolver (${newDetail.amount}) excede el stock disponible (${result[0].available}).`,
                true
            )
        }
    }

}