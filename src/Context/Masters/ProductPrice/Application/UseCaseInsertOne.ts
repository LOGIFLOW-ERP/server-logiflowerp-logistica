import { inject, injectable } from 'inversify';
import { PRODUCT_PRICE_TYPES } from '../Infrastructure/IoC';
import { IProductPriceMongoRepository } from '../Domain';
import { CreateProductPriceDTO, ProductPriceENTITY, validateCustom } from 'logiflowerp-sdk';
import { UnprocessableEntityException } from '@Config/exception';

@injectable()
export class UseCaseInsertOne {

    constructor(
        @inject(PRODUCT_PRICE_TYPES.MongoRepository) private readonly repository: IProductPriceMongoRepository,
    ) { }

    async exec(dto: CreateProductPriceDTO) {
        const _entity = new ProductPriceENTITY()
        _entity.set(dto)
        const entity = await validateCustom(_entity, ProductPriceENTITY, UnprocessableEntityException)
        return this.repository.insertOne(entity)
    }

}