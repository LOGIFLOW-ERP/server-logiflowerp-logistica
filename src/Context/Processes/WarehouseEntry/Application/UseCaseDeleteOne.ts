import { inject, injectable } from 'inversify'
import { IWarehouseEntryMongoRepository } from '../Domain'
import { WAREHOUSE_ENTRY_TYPES } from '../Infrastructure/IoC'
import { StateOrder } from 'logiflowerp-sdk'
import { ConflictException, TooManyRequestsException } from '@Config/exception'

@injectable()
export class UseCaseDeleteOne {

    constructor(
        @inject(WAREHOUSE_ENTRY_TYPES.RepositoryMongo) private readonly repository: IWarehouseEntryMongoRepository,
    ) { }

    async exec(_id: string) {
        const pipeline = [{ $match: { _id } }]
        const document = await this.repository.selectOne(pipeline)
        if (document.state === StateOrder.PROCESANDO) {
            throw new TooManyRequestsException(
                `¡Se está procesando el detalle de este documento!`,
                true
            )
        }
        if (document.state !== StateOrder.REGISTRADO) {
            throw new ConflictException(
                `¡El estado de la orden para eliminar debe ser ${StateOrder.REGISTRADO}!`,
                true
            )
        }
        return this.repository.deleteOne({ _id })
    }

}