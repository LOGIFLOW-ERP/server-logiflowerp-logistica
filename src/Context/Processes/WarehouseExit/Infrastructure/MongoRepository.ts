import { MongoRepository } from '@Shared/Infrastructure/Repositories/Mongo'
import { IWarehouseExitMongoRepository } from '../Domain'
import { AuthUserDTO, WarehouseExitENTITY } from 'logiflowerp-sdk'
import { inject, injectable } from 'inversify'
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC'

@injectable()
export class WarehouseExitMongoRepository extends MongoRepository<WarehouseExitENTITY> implements IWarehouseExitMongoRepository {

    constructor(
        @inject('collection') protected readonly collection: string,
        @inject('database') protected readonly database: string,
        @inject(SHARED_TYPES.User) protected readonly user: AuthUserDTO,
    ) {
        super(database, collection, user)
    }

}