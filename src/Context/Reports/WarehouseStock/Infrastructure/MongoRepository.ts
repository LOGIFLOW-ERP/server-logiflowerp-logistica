import { MongoRepository } from '@Shared/Infrastructure/Repositories/Mongo'
import { IWarehouseStockMongoRepository } from '../Domain'
import { AuthUserDTO, WarehouseStockENTITY } from 'logiflowerp-sdk'
import { inject, injectable } from 'inversify'
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC'

@injectable()
export class WarehouseStockMongoRepository extends MongoRepository<WarehouseStockENTITY> implements IWarehouseStockMongoRepository {

    constructor(
        @inject('collection') protected readonly collection: string,
        @inject('database') protected readonly database: string,
        @inject(SHARED_TYPES.User) protected readonly user: AuthUserDTO,
    ) {
        super(database, collection, user)
    }

}