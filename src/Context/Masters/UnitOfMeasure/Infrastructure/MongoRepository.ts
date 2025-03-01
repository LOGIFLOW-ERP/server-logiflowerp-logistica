import { MongoRepository } from '@Shared/Infrastructure/Repositories/Mongo'
import { IUnitOfMeasureMongoRepository } from '../Domain'
import { inject, injectable } from 'inversify'
import { UnitOfMeasureENTITY } from 'logiflowerp-sdk'
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC'

@injectable()
export class UnitOfMeasuresMongoRepository extends MongoRepository<UnitOfMeasureENTITY> implements IUnitOfMeasureMongoRepository {

    constructor(
        @inject(SHARED_TYPES.database_logiflow) database: string,
        @inject(SHARED_TYPES.collection_unitOfMeasures) collection: string,
    ) {
        super(database, collection)
    }

}