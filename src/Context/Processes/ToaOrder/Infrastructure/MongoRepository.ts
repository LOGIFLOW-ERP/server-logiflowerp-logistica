import { MongoRepository } from '@Shared/Infrastructure/Repositories/Mongo'
import { ITOAOrderMongoRepository } from '../Domain'
import { AuthUserDTO, TOAOrderENTITY } from 'logiflowerp-sdk'
import { inject, injectable } from 'inversify'
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC'

@injectable()
export class TOAOrderMongoRepository extends MongoRepository<TOAOrderENTITY> implements ITOAOrderMongoRepository {
    constructor(
        @inject('collection') protected readonly collection: string,
        @inject('database') protected readonly database: string,
        @inject(SHARED_TYPES.User) protected readonly user: AuthUserDTO,
    ) {
        super(database, collection, user)
    }
}