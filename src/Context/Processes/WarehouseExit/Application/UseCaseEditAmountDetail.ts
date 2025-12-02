import { AddDetail, IWarehouseExitMongoRepository } from '../Domain';
import {
    collections,
    EditAmountDetailDTO,
    OrderDetailENTITY,
    StateOrder,
    StateWarehouseStock,
    WarehouseStockENTITY,
} from 'logiflowerp-sdk';
import { BadRequestException, NotFoundException } from '@Config/exception';
import { WAREHOUSE_EXIT_TYPES } from '../Infrastructure/IoC';
import { inject, injectable } from 'inversify';

@injectable()
export class UseCaseEditAmountDetail extends AddDetail {
    constructor(
        @inject(WAREHOUSE_EXIT_TYPES.RepositoryMongo) protected readonly repository: IWarehouseExitMongoRepository,
    ) {
        super(repository)
    }

    async exec(_id: string, keyDetail: string, dto: EditAmountDetailDTO) {
        await this.searchDocument(_id)
        const detail = this.searchDetail(keyDetail)

        if (detail.serials.length > dto.amount) {
            throw new BadRequestException('La cantidad no puede ser menor a la cantidad de series.', true)
        }

        const warehouseStock = await this._searchWarehouseStock(detail)
        const newDetail = await this.buildDetail(this.document, { amount: dto.amount, warehouseStock }, false, detail.amount)
        return this.repository.updateOne(
            {
                _id: this.document._id,
                'detail.keyDetail': warehouseStock.keyDetail
            },
            {
                $set: {
                    'detail.$.amount': newDetail.amount
                }
            }
        )
    }

    private async searchDocument(_id: string) {
        const pipeline = [{ $match: { _id, state: { $ne: StateOrder.VALIDADO } } }]
        this.document = await this.repository.selectOne(pipeline)
    }

    private searchDetail(keyDetail: string) {
        const detail = this.document.detail.find(item => item.keyDetail === keyDetail)
        if (!detail) {
            throw new NotFoundException('Detalle no encontrado o ya eliminado.', true)
        }
        return detail
    }

    private async _searchWarehouseStock(detail: OrderDetailENTITY) {
        const pipeline = [{ $match: { keySearch: detail.keySearch, keyDetail: detail.keyDetail, 'store.code': this.document.store.code } }]
        const warehouseStock = await this.repository.selectOne<WarehouseStockENTITY>(pipeline, collections.warehouseStock)
        if (warehouseStock.state !== StateWarehouseStock.ACTIVO) {
            throw new BadRequestException(
                `El estado del stock almacén ${warehouseStock.keyDetail} es ${warehouseStock.state}. No se puede realizar la acción.`,
                true
            )
        }
        return warehouseStock
    }
}