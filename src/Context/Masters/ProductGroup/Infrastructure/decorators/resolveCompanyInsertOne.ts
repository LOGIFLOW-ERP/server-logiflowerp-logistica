import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { PRODUCT_GROUP_TYPES } from '../IoC';
import { UseCaseInsertOne } from '../../Application';
import { ProductGroupMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyInsertOne = resolveCompanyDecorator(
    PRODUCT_GROUP_TYPES.UseCaseInsertOne,
    UseCaseInsertOne,
    PRODUCT_GROUP_TYPES.RepositoryMongo,
    ProductGroupMongoRepository,
    collection
)