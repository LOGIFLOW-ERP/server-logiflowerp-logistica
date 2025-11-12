import { AddDetail, IWarehouseEntryMongoRepository } from '../Domain';
import {
    CreateOrderDetailDTO,
    OrderDetailENTITY,
    ProductPriceENTITY,
    StateOrder,
    WarehouseEntryENTITY,
    collections,
    validateCustom
} from 'logiflowerp-sdk';
import {
    BadRequestException,
    UnprocessableEntityException
} from '@Config/exception';
import { WAREHOUSE_ENTRY_TYPES } from '../Infrastructure/IoC';
import { inject, injectable } from 'inversify';

@injectable()
export class UseCaseAddDetail extends AddDetail {

    private document!: WarehouseEntryENTITY

    constructor(
        @inject(WAREHOUSE_ENTRY_TYPES.RepositoryMongo) private readonly repository: IWarehouseEntryMongoRepository,
    ) {
        super()
    }

    async exec(_id: string, dto: CreateOrderDetailDTO) {
        await this.searchDocument(_id)
        const productPrice = await this.searchProductPrice(dto)
        const newDetail = await this.buildDetail(this.document, dto, productPrice)
        this.validateDetail(newDetail)
        return this.repository.updateOne({ _id }, { $push: { detail: newDetail } })
    }

    private async searchDocument(_id: string) {
        const pipeline = [{ $match: { _id, state: { $ne: StateOrder.VALIDADO } } }]
        this.document = await this.repository.selectOne(pipeline)
    }

    private searchProductPrice(dto: CreateOrderDetailDTO) {
        const pipeline = [{ $match: { itemCode: dto.item.itemCode, isDeleted: false } }]
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
}