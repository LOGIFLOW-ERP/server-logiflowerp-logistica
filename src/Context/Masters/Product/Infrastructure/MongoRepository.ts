import { MongoRepository } from '@Shared/Infrastructure/Repositories/Mongo'
import { IProductMongoRepository } from '../Domain'
import { AuthUserDTO, ProductENTITY } from 'logiflowerp-sdk'
import { inject, injectable } from 'inversify'
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC'

@injectable()
export class ProductMongoRepository extends MongoRepository<ProductENTITY> implements IProductMongoRepository {

    constructor(
        @inject('collection') protected readonly collection: string,
        @inject('database') protected readonly database: string,
        @inject(SHARED_TYPES.User) protected readonly user: AuthUserDTO,
    ) {
        super(database, collection, user)
    }

}