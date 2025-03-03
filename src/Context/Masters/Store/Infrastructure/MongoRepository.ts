import { MongoRepository } from '@Shared/Infrastructure/Repositories/Mongo'
import { IStoreMongoRepository } from '../Domain'
import { inject, injectable } from 'inversify'
import { StoreENTITY } from 'logiflowerp-sdk'
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC'

@injectable()
export class StoreMongoRepository extends MongoRepository<StoreENTITY> implements IStoreMongoRepository {

    constructor(
        @inject(SHARED_TYPES.database_logiflow) database: string,
        @inject(SHARED_TYPES.collection_stores) collection: string,
    ) {
        super(database, collection)
    }

}