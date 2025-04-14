import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { PRODUCT_TYPES } from '../IoC';
import { UseCaseFind } from '../../Application';
import { ProductMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyFind = resolveCompanyDecorator(
    PRODUCT_TYPES.UseCaseFind,
    UseCaseFind,
    PRODUCT_TYPES.RepositoryMongo,
    ProductMongoRepository,
    collection
)