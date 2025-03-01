import { MongoRepository } from '@Shared/Infrastructure/Repositories/Mongo'
import { IProductPriceMongoRepository } from '../Domain'
import { inject, injectable } from 'inversify'
import { ProductPriceENTITY } from 'logiflowerp-sdk'
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC'

@injectable()
export class ProductPriceMongoRepository extends MongoRepository<ProductPriceENTITY> implements IProductPriceMongoRepository {

    constructor(
        @inject(SHARED_TYPES.database_logiflow) database: string,
        @inject(SHARED_TYPES.collection_productPrices) collection: string,
    ) {
        super(database, collection)
    }

}