import { inject, injectable } from 'inversify'
import { IWarehouseEntryMongoRepository } from '../Domain'
import { WAREHOUSE_ENTRY_TYPES } from '../Infrastructure/IoC'
import { StateOrder } from 'logiflowerp-sdk'

@injectable()
export class UseCaseDeleteOne {

    constructor(
        @inject(WAREHOUSE_ENTRY_TYPES.RepositoryMongo) private readonly repository: IWarehouseEntryMongoRepository,
    ) { }

    async exec(_id: string) {
        const pipeline = [{ $match: { _id, state: { $ne: StateOrder.VALIDADO } } }]
        await this.repository.selectOne(pipeline)
        return this.repository.deleteOne({ _id })
    }

}