import { MongoRepository } from '@Shared/Infrastructure/Repositories/Mongo'
import { IProductMongoRepository } from '../Domain'
import { ProductENTITY } from 'logiflowerp-sdk'
import { collection } from './config'

export class ProductMongoRepository extends MongoRepository<ProductENTITY> implements IProductMongoRepository {

    constructor(companyCode: string) {
        super(`${companyCode}_${collection}`)
    }

}