import { MongoRepository } from '@Shared/Infrastructure/Repositories/Mongo'
import { IStoreMongoRepository } from '../Domain'
import { StoreENTITY } from 'logiflowerp-sdk'
import { inject, injectable } from 'inversify'

@injectable()
export class StoreMongoRepository extends MongoRepository<StoreENTITY> implements IStoreMongoRepository {

    constructor(
        @inject('collection') protected readonly collection: string,
        @inject('database') protected readonly database: string,
    ) {
        super(database, collection)
    }

}