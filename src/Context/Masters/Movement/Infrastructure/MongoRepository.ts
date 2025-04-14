import { MongoRepository } from '@Shared/Infrastructure/Repositories/Mongo'
import { IMovementMongoRepository } from '../Domain'
import { MovementENTITY } from 'logiflowerp-sdk'
import { inject, injectable } from 'inversify'

@injectable()
export class MovementMongoRepository extends MongoRepository<MovementENTITY> implements IMovementMongoRepository {

    constructor(
        @inject('collection') protected readonly collection: string,
        @inject('database') protected readonly database: string,
    ) {
        super(database, collection)
    }

}