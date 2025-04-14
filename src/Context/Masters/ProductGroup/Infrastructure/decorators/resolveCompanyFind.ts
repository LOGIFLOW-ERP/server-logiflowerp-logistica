import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { PRODUCT_GROUP_TYPES } from '../IoC';
import { UseCaseFind } from '../../Application';
import { ProductGroupMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyFind = resolveCompanyDecorator(
    PRODUCT_GROUP_TYPES.UseCaseFind,
    UseCaseFind,
    PRODUCT_GROUP_TYPES.RepositoryMongo,
    ProductGroupMongoRepository,
    collection
)