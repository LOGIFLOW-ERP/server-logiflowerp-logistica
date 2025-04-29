import { MongoRepository } from '@Shared/Infrastructure/Repositories/Mongo'
import { IEmployeeStockMongoRepository } from '../Domain'
import { AuthUserDTO, EmployeeStockENTITY } from 'logiflowerp-sdk'
import { inject, injectable } from 'inversify'
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC'

@injectable()
export class EmployeeStockMongoRepository extends MongoRepository<EmployeeStockENTITY> implements IEmployeeStockMongoRepository {

    constructor(
        @inject('collection') protected readonly collection: string,
        @inject('database') protected readonly database: string,
        @inject(SHARED_TYPES.User) protected readonly user: AuthUserDTO,
    ) {
        super(database, collection, user)
    }

}