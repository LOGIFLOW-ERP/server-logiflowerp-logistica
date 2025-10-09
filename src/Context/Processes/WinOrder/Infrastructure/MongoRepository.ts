import { MongoRepository } from '@Shared/Infrastructure/Repositories/Mongo'
import { IWINOrderMongoRepository } from '../Domain'
import { AuthUserDTO, WINOrderENTITY } from 'logiflowerp-sdk'
import { inject, injectable } from 'inversify'
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC'

@injectable()
export class WINOrderMongoRepository extends MongoRepository<WINOrderENTITY> implements IWINOrderMongoRepository {
    constructor(
        @inject('collection') protected readonly collection: string,
        @inject('database') protected readonly database: string,
        @inject(SHARED_TYPES.User) protected readonly user: AuthUserDTO,
    ) {
        super(database, collection, user)
    }
}