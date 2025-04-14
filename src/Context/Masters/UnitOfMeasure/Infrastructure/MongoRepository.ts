import { MongoRepository } from '@Shared/Infrastructure/Repositories/Mongo'
import { IUnitOfMeasureMongoRepository } from '../Domain'
import { UnitOfMeasureENTITY } from 'logiflowerp-sdk'
import { inject, injectable } from 'inversify'

@injectable()
export class UnitOfMeasureMongoRepository extends MongoRepository<UnitOfMeasureENTITY> implements IUnitOfMeasureMongoRepository {

    constructor(
        @inject('collection') protected readonly collection: string,
        @inject('database') protected readonly database: string,
    ) {
        super(database, collection)
    }

}