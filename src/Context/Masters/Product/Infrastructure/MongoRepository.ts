import { MongoRepository } from '@Shared/Infrastructure/Repositories/Mongo'
import { IProductMongoRepository } from '../Domain'
import { ProductENTITY } from 'logiflowerp-sdk'
import { inject, injectable } from 'inversify'

@injectable()
export class ProductMongoRepository extends MongoRepository<ProductENTITY> implements IProductMongoRepository {

    constructor(
        @inject('collection') protected readonly collection: string,
        @inject('database') protected readonly database: string,
    ) {
        super(database, collection)
    }

}