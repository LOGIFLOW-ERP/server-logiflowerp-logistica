import { MongoRepository } from '@Shared/Infrastructure/Repositories'
import { IProductMongoRepository } from '../Domain'
import { inject, injectable } from 'inversify'
import { ProductENTITY } from 'logiflowerp-sdk'
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC'

@injectable()
export class ProductMongoRepository extends MongoRepository<ProductENTITY> implements IProductMongoRepository {

    constructor(
        @inject(SHARED_TYPES.database_logiflow) database: string,
        @inject(SHARED_TYPES.collection_products) collection: string,
    ) {
        super(database, collection)
    }

}