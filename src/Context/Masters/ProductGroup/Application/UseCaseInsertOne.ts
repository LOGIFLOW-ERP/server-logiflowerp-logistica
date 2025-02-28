import { inject, injectable } from 'inversify';
import { PRODUCT_GROUP_TYPES } from '../Infrastructure/IoC';
import { IProductGroupMongoRepository } from '../Domain';
import { CreateProductGroupDTO, ProductGroupENTITY } from 'logiflowerp-sdk';

@injectable()
export class UseCaseInsertOne {

    constructor(
        @inject(PRODUCT_GROUP_TYPES.MongoRepository) private readonly repository: IProductGroupMongoRepository,
    ) { }

    async exec(dto: CreateProductGroupDTO) {
        const entity = new ProductGroupENTITY()
        entity.set(dto)
        return this.repository.insertOne(entity)
    }

}