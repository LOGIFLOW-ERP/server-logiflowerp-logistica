import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { PRODUCT_PRICE_TYPES } from '../IoC';
import { UseCaseFind } from '../../Application';
import { ProductPriceMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyFind = resolveCompanyDecorator(
    PRODUCT_PRICE_TYPES.UseCaseFind,
    UseCaseFind,
    PRODUCT_PRICE_TYPES.RepositoryMongo,
    ProductPriceMongoRepository,
    collection
)