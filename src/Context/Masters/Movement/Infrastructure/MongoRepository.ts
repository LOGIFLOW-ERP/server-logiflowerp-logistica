import { MongoRepository } from '@Shared/Infrastructure/Repositories/Mongo'
import { IMovementMongoRepository } from '../Domain'
import { MovementENTITY } from 'logiflowerp-sdk'
import { collection } from './config'

export class MovementMongoRepository extends MongoRepository<MovementENTITY> implements IMovementMongoRepository {

    constructor(companyCode: string) {
        super(`${companyCode}_${collection}`)
    }

}