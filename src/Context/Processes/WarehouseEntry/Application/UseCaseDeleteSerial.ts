import { IWarehouseEntryMongoRepository } from '../Domain';
import {
    StateOrder,
    WarehouseEntryENTITY,
} from 'logiflowerp-sdk';
import { NotFoundException } from '@Config/exception';
import { WAREHOUSE_ENTRY_TYPES } from '../Infrastructure/IoC';
import { inject, injectable } from 'inversify';

@injectable()
export class UseCaseDeleteSerial {

    private document!: WarehouseEntryENTITY

    constructor(
        @inject(WAREHOUSE_ENTRY_TYPES.RepositoryMongo) private readonly repository: IWarehouseEntryMongoRepository,
    ) { }

    async exec(_id: string, { keyDetail, serial }: { keyDetail: string, serial: string }) {
        await this.searchDocument(_id)
        this.validateDetail(keyDetail)
        return this.repository.updateOne(
            {
                _id,
                'detail.keyDetail': keyDetail
            },
            {
                $pull: {
                    'detail.$.serials': {
                        serial: serial
                    }
                }
            }
        )
    }

    private async searchDocument(_id: string) {
        const pipeline = [{ $match: { _id, state: { $ne: StateOrder.VALIDADO } } }]
        this.document = await this.repository.selectOne(pipeline)
    }

    private validateDetail(keyDetail: string) {
        if (!this.document.detail.some(item => item.keyDetail === keyDetail)) {
            throw new NotFoundException('Detalle no encontrado o ya eliminado.', true)
        }
    }

}