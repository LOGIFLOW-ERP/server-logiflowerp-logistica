import { IWarehouseEntryMongoRepository } from '../Domain';
import {
    StateOrder,
    WarehouseEntryENTITY,
} from 'logiflowerp-sdk';
import { ConflictException, NotFoundException, TooManyRequestsException } from '@Config/exception';
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
        const pipeline = [{ $match: { _id } }]
        this.document = await this.repository.selectOne(pipeline)
        if (this.document.state === StateOrder.PROCESANDO) {
            throw new TooManyRequestsException(
                `¡Se está procesando el detalle de este documento!`,
                true
            )
        }
        if (this.document.state !== StateOrder.REGISTRADO) {
            throw new ConflictException(
                `¡El estado de la orden para eliminar serie debe ser ${StateOrder.REGISTRADO}!`,
                true
            )
        }
    }

    private validateDetail(keyDetail: string) {
        if (!this.document.detail.some(item => item.keyDetail === keyDetail)) {
            throw new NotFoundException('Detalle no encontrado o ya eliminado.', true)
        }
    }

}