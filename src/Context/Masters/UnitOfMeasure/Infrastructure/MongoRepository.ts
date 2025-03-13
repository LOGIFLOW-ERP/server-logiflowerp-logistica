import { MongoRepository } from '@Shared/Infrastructure/Repositories/Mongo'
import { IUnitOfMeasureMongoRepository } from '../Domain'
import { UnitOfMeasureENTITY } from 'logiflowerp-sdk'
import { collection } from './config'

export class UnitOfMeasureMongoRepository extends MongoRepository<UnitOfMeasureENTITY> implements IUnitOfMeasureMongoRepository {

    constructor(companyCode: string) {
        super(`${companyCode}_${collection}`)
    }

}