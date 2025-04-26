import { IWarehouseEntryMongoRepository } from '../Domain';
import {
    CreateOrderDetailDTO,
    OrderDetailENTITY,
    StateOrder,
    WarehouseEntryENTITY,
    validateCustom
} from 'logiflowerp-sdk';
import {
    BadRequestException,
    ConflictException,
    UnprocessableEntityException
} from '@Config/exception';
import { WAREHOUSE_ENTRY_TYPES } from '../Infrastructure/IoC';
import { inject, injectable } from 'inversify';

@injectable()
export class UseCaseAddDetail {

    private document!: WarehouseEntryENTITY

    constructor(
        @inject(WAREHOUSE_ENTRY_TYPES.RepositoryMongo) private readonly repository: IWarehouseEntryMongoRepository,
    ) { }

    async exec(_id: string, dto: CreateOrderDetailDTO) {
        await this.searchDocument(_id)
        const newDetail = await this.buildDetail(dto)
        this.validateExistenceDetail(newDetail)
        return this.repository.updateOne({ _id }, { $push: { detail: newDetail } })
    }

    private async searchDocument(_id: string) {
        this.document = await this.repository.selectOne([{ $match: { _id } }])
        if (this.document.state === StateOrder.VALIDADO) {
            throw new ConflictException('No se puede agregar un detalle a un ingreso validado', true)
        }
    }

    private validateExistenceDetail(newDetail: OrderDetailENTITY) {
        if (this.document.detail.some(item => item.keyDetail === newDetail.keyDetail)) {
            throw new BadRequestException('Ya existe un detalle con el mismo keyDetail', true)
        }
    }

    private buildDetail(dto: CreateOrderDetailDTO) {
        const lastPosition = this.document.detail.reduce((acc, item) => Math.max(acc, item.position), 0)
        const detail = new OrderDetailENTITY()
        detail.set(dto)
        detail.codestore = this.document.store.code
        detail.stockType = this.document.movement.stockType
        detail.position = lastPosition + 1
        return validateCustom(detail, OrderDetailENTITY, UnprocessableEntityException)
    }

}