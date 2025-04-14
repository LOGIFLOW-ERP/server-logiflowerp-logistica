import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { PRODUCT_PRICE_TYPES } from '../IoC';
import { UseCaseUpdateOne } from '../../Application';
import { ProductPriceMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyUpdateOne = resolveCompanyDecorator(
    PRODUCT_PRICE_TYPES.UseCaseUpdateOne,
    UseCaseUpdateOne,
    PRODUCT_PRICE_TYPES.RepositoryMongo,
    ProductPriceMongoRepository,
    collection
)