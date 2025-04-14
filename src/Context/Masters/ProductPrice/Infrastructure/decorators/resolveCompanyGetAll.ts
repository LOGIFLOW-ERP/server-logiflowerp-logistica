import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { PRODUCT_PRICE_TYPES } from '../IoC';
import { UseCaseGetAll } from '../../Application';
import { ProductPriceMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyGetAll = resolveCompanyDecorator(
    PRODUCT_PRICE_TYPES.UseCaseGetAll,
    UseCaseGetAll,
    PRODUCT_PRICE_TYPES.RepositoryMongo,
    ProductPriceMongoRepository,
    collection
)