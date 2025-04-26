import { MongoRepository } from '@Shared/Infrastructure/Repositories/Mongo'
import { IWarehouseEntryMongoRepository } from '../Domain'
import { AuthUserDTO, WarehouseEntryENTITY } from 'logiflowerp-sdk'
import { inject, injectable } from 'inversify'
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC'

@injectable()
export class WarehouseEntryMongoRepository extends MongoRepository<WarehouseEntryENTITY> implements IWarehouseEntryMongoRepository {

    constructor(
        @inject('collection') protected readonly collection: string,
        @inject('database') protected readonly database: string,
        @inject(SHARED_TYPES.User) protected readonly user: AuthUserDTO,
    ) {
        super(database, collection, user)
    }

}