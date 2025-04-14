import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { PRODUCT_GROUP_TYPES } from '../IoC';
import { UseCaseDeleteOne } from '../../Application';
import { ProductGroupMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyDeleteOne = resolveCompanyDecorator(
    PRODUCT_GROUP_TYPES.UseCaseDeleteOne,
    UseCaseDeleteOne,
    PRODUCT_GROUP_TYPES.RepositoryMongo,
    ProductGroupMongoRepository,
    collection
)