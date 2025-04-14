import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { PRODUCT_GROUP_TYPES } from '../IoC';
import { UseCaseGetAll } from '../../Application';
import { ProductGroupMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyGetAll = resolveCompanyDecorator(
    PRODUCT_GROUP_TYPES.UseCaseGetAll,
    UseCaseGetAll,
    PRODUCT_GROUP_TYPES.RepositoryMongo,
    ProductGroupMongoRepository,
    collection
)