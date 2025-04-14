import { MongoRepository } from '@Shared/Infrastructure/Repositories/Mongo'
import { IProductGroupMongoRepository } from '../Domain'
import { ProductGroupENTITY } from 'logiflowerp-sdk'
import { inject, injectable } from 'inversify'

@injectable()
export class ProductGroupMongoRepository extends MongoRepository<ProductGroupENTITY> implements IProductGroupMongoRepository {

    constructor(
        @inject('collection') protected readonly collection: string,
        @inject('database') protected readonly database: string,
    ) {
        super(database, collection)
    }

}