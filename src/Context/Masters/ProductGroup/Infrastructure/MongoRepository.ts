import { MongoRepository } from '@Shared/Infrastructure/Repositories/Mongo'
import { IProductGroupMongoRepository } from '../Domain'
import { inject, injectable } from 'inversify'
import { ProductGroupENTITY } from 'logiflowerp-sdk'
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC'

@injectable()
export class ProductGroupMongoRepository extends MongoRepository<ProductGroupENTITY> implements IProductGroupMongoRepository {

    constructor(
        @inject(SHARED_TYPES.database_logiflow) database: string,
        @inject(SHARED_TYPES.collection_productGroups) collection: string,
    ) {
        super(database, collection)
    }

}