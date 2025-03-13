import { MongoRepository } from '@Shared/Infrastructure/Repositories/Mongo'
import { IStoreMongoRepository } from '../Domain'
import { StoreENTITY } from 'logiflowerp-sdk'
import { collection } from './config'

export class StoreMongoRepository extends MongoRepository<StoreENTITY> implements IStoreMongoRepository {

    constructor(companyCode: string) {
        super(`${companyCode}_${collection}`)
    }

}