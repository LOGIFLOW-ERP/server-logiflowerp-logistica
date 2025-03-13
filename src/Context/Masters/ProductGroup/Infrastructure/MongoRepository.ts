import { MongoRepository } from '@Shared/Infrastructure/Repositories/Mongo'
import { IProductGroupMongoRepository } from '../Domain'
import { ProductGroupENTITY } from 'logiflowerp-sdk'
import { collection } from './config'

export class ProductGroupMongoRepository extends MongoRepository<ProductGroupENTITY> implements IProductGroupMongoRepository {

    constructor(companyCode: string) {
        super(`${companyCode}_${collection}`)
    }

}