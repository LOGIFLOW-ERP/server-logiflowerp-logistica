import { inject, injectable } from 'inversify'
import { IWarehouseEntryMongoRepository } from '../Domain'
import { WAREHOUSE_ENTRY_TYPES } from '../Infrastructure/IoC'
import { StateOrder } from 'logiflowerp-sdk'
import { ConflictException } from '@Config/exception'

@injectable()
export class UseCaseDeleteOne {

    constructor(
        @inject(WAREHOUSE_ENTRY_TYPES.RepositoryMongo) private readonly repository: IWarehouseEntryMongoRepository,
    ) { }

    async exec(_id: string) {
        const doc = await this.repository.select([{ $match: { _id } }])
        if (doc.length && doc[0].state === StateOrder.VALIDADO) {
            throw new ConflictException('No se puede eliminar un ingreso validado', true)
        }
        return this.repository.deleteOne({ _id })
    }

}