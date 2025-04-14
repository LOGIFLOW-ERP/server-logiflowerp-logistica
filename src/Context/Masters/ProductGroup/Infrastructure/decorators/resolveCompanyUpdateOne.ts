import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { PRODUCT_GROUP_TYPES } from '../IoC';
import { UseCaseUpdateOne } from '../../Application';
import { ProductGroupMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyUpdateOne = resolveCompanyDecorator(
    PRODUCT_GROUP_TYPES.UseCaseUpdateOne,
    UseCaseUpdateOne,
    PRODUCT_GROUP_TYPES.RepositoryMongo,
    ProductGroupMongoRepository,
    collection
)