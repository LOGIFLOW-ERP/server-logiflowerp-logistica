import { IProductPriceMongoRepository } from '../Domain';
import { collections, CreateProductPriceDTO, ProductENTITY, ProductPriceENTITY, validateCustom } from 'logiflowerp-sdk';
import { UnprocessableEntityException } from '@Config/exception';
import { PRODUCT_PRICE_TYPES } from '../Infrastructure/IoC';
import { inject, injectable } from 'inversify';

@injectable()
export class UseCaseInsertOne {

    constructor(
        @inject(PRODUCT_PRICE_TYPES.RepositoryMongo) private readonly repository: IProductPriceMongoRepository,
    ) { }

    async exec(dto: CreateProductPriceDTO) {
        const pipeline = [{ $match: { itemCode: dto.itemCode } }]
        await this.repository.selectOne<ProductENTITY>(pipeline, collections.product)
        const _entity = new ProductPriceENTITY()
        _entity.set(dto)
        _entity.priceMax = _entity.price
        const entity = await validateCustom(_entity, ProductPriceENTITY, UnprocessableEntityException)
        return this.repository.insertOne(entity)
    }

}