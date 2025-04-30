import { MongoRepository } from '@Shared/Infrastructure/Repositories/Mongo'
import { IWarehouseReturnMongoRepository } from '../Domain'
import { AuthUserDTO, WarehouseReturnENTITY } from 'logiflowerp-sdk'
import { inject, injectable } from 'inversify'
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC'

@injectable()
export class WarehouseReturnMongoRepository extends MongoRepository<WarehouseReturnENTITY> implements IWarehouseReturnMongoRepository {

    constructor(
        @inject('collection') protected readonly collection: string,
        @inject('database') protected readonly database: string,
        @inject(SHARED_TYPES.User) protected readonly user: AuthUserDTO,
    ) {
        super(database, collection, user)
    }

}