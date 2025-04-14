import { MongoRepository } from '@Shared/Infrastructure/Repositories/Mongo'
import { IProductPriceMongoRepository } from '../Domain'
import { ProductPriceENTITY } from 'logiflowerp-sdk'
import { inject, injectable } from 'inversify'

@injectable()
export class ProductPriceMongoRepository extends MongoRepository<ProductPriceENTITY> implements IProductPriceMongoRepository {

    constructor(
        @inject('collection') protected readonly collection: string,
        @inject('database') protected readonly database: string,
    ) {
        super(database, collection)
    }

}