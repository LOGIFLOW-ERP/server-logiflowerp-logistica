import { MongoRepository } from '@Shared/Infrastructure/Repositories/Mongo'
import { IProductPriceMongoRepository } from '../Domain'
import { ProductPriceENTITY } from 'logiflowerp-sdk'
import { collection } from './config'

export class ProductPriceMongoRepository extends MongoRepository<ProductPriceENTITY> implements IProductPriceMongoRepository {

    constructor(companyCode: string) {
        super(`${companyCode}_${collection}`)
    }

}