import { MongoRepository } from '@Shared/Infrastructure/Repositories'
import { IMovementMongoRepository } from '../Domain'
import { inject, injectable } from 'inversify'
import { MovementENTITY } from 'logiflowerp-sdk'
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC'

@injectable()
export class MovementMongoRepository extends MongoRepository<MovementENTITY> implements IMovementMongoRepository {

    constructor(
        @inject(SHARED_TYPES.database_logiflow) database: string,
        @inject(SHARED_TYPES.collection_movements) collection: string,
    ) {
        super(database, collection)
    }

}