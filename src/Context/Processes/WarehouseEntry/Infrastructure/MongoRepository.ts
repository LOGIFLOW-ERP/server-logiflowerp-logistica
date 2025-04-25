import { MongoRepository } from '@Shared/Infrastructure/Repositories/Mongo'
import { IWarehouseEntryMongoRepository } from '../Domain'
import { WarehouseEntryENTITY } from 'logiflowerp-sdk'
import { inject, injectable } from 'inversify'

@injectable()
export class WarehouseEntryMongoRepository extends MongoRepository<WarehouseEntryENTITY> implements IWarehouseEntryMongoRepository {

    constructor(
        @inject('collection') protected readonly collection: string,
        @inject('database') protected readonly database: string,
    ) {
        super(database, collection)
    }

}