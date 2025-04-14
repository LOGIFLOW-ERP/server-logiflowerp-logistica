import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { PRODUCT_PRICE_TYPES } from '../IoC';
import { UseCaseInsertOne } from '../../Application';
import { ProductPriceMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyInsertOne = resolveCompanyDecorator(
    PRODUCT_PRICE_TYPES.UseCaseInsertOne,
    UseCaseInsertOne,
    PRODUCT_PRICE_TYPES.RepositoryMongo,
    ProductPriceMongoRepository,
    collection
)