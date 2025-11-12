import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { PRODUCT_TYPES } from '../IoC';
import { UseCaseInsertBulk } from '../../Application';
import { ProductMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyInsertBulk = resolveCompanyDecorator(
    PRODUCT_TYPES.UseCaseInsertBulk,
    UseCaseInsertBulk,
    PRODUCT_TYPES.RepositoryMongo,
    ProductMongoRepository,
    collection
)