import { MongoRepository } from '@Shared/Infrastructure/Repositories/Mongo'
import { ICMSOrderMongoRepository } from '../Domain'
import { AuthUserDTO, CMSOrderENTITY } from 'logiflowerp-sdk'
import { inject, injectable } from 'inversify'
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC'

@injectable()
export class CMSOrderMongoRepository extends MongoRepository<CMSOrderENTITY> implements ICMSOrderMongoRepository {
    constructor(
        @inject('collection') protected readonly collection: string,
        @inject('database') protected readonly database: string,
        @inject(SHARED_TYPES.User) protected readonly user: AuthUserDTO,
    ) {
        super(database, collection, user)
    }
}