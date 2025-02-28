import { inject, injectable } from 'inversify';
import { PRODUCT_GROUP_TYPES } from '../Infrastructure/IoC';
import { IProductGroupMongoRepository } from '../Domain';
import { ProductGroupENTITY } from 'logiflowerp-sdk';

@injectable()
export class UseCaseInsertOne {

    constructor(
        @inject(PRODUCT_GROUP_TYPES.MongoRepository) private readonly repository: IProductGroupMongoRepository,
    ) { }

    async exec(dto: ProductGroupENTITY) {
        return this.repository.insertOne(dto)
    }

}