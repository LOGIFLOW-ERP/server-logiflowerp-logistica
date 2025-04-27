import { IWarehouseEntryMongoRepository } from '../Domain';
import {
    StateOrder,
    StockSerialDTO,
    WarehouseEntryENTITY,
} from 'logiflowerp-sdk';
import { ConflictException, NotFoundException } from '@Config/exception';
import { WAREHOUSE_ENTRY_TYPES } from '../Infrastructure/IoC';
import { inject, injectable } from 'inversify';

@injectable()
export class UseCaseAddSerial {

    private document!: WarehouseEntryENTITY

    constructor(
        @inject(WAREHOUSE_ENTRY_TYPES.RepositoryMongo) private readonly repository: IWarehouseEntryMongoRepository,
    ) { }

    async exec(_id: string, keyDetail: string, dto: StockSerialDTO) {
        await this.searchDocument(_id)
        this.validateDetail(keyDetail, dto)
        return this.repository.updateOne(
            {
                _id,
                'detail.keyDetail': keyDetail
            },
            {
                $push: {
                    'detail.$.serials': dto
                }
            }
        )
    }

    private async searchDocument(_id: string) {
        const pipeline = [{ $match: { _id, state: { $ne: StateOrder.VALIDADO } } }]
        this.document = await this.repository.selectOne(pipeline)
    }

    private validateDetail(keyDetail: string, dto: StockSerialDTO) {
        const detail = this.document.detail.find(item => item.keyDetail === keyDetail)
        if (!detail) {
            throw new NotFoundException('Detalle no encontrado o ya eliminado.', true)
        }
        if (detail.serials.length >= detail.amount) {
            throw new ConflictException('Ya se ha alcanzado la cantidad máxima de series permitidas para este detalle.', true)
        }
        if (detail.serials.some(e => e.serial === dto.serial)) {
            throw new ConflictException('El serial ya existe en el detalle.', true)
        }
    }

}