import { IProductMongoRepository } from '../Domain';
import { CreateProductDTO, ProductENTITY, validateCustom } from 'logiflowerp-sdk';
import { UnprocessableEntityException } from '@Config/exception';
import { PRODUCT_TYPES } from '../Infrastructure/IoC';
import { inject, injectable } from 'inversify';

@injectable()
export class UseCaseInsertOne {

    constructor(
        @inject(PRODUCT_TYPES.RepositoryMongo) private readonly repository: IProductMongoRepository,
    ) { }

    async exec(dto: CreateProductDTO) {
        const _entity = new ProductENTITY()
        _entity.set(dto)
        _entity._id = crypto.randomUUID()
        const entity = await validateCustom(_entity, ProductENTITY, UnprocessableEntityException)
        return this.repository.insertOne(entity)
    }

}