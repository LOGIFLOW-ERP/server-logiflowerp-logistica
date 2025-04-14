import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { PRODUCT_PRICE_TYPES } from '../IoC';
import { UseCaseDeleteOne } from '../../Application';
import { ProductPriceMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyDeleteOne = resolveCompanyDecorator(
    PRODUCT_PRICE_TYPES.UseCaseDeleteOne,
    UseCaseDeleteOne,
    PRODUCT_PRICE_TYPES.RepositoryMongo,
    ProductPriceMongoRepository,
    collection
)