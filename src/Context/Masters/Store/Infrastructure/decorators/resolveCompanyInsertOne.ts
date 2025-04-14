import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { STORE_TYPES } from '../IoC';
import { UseCaseInsertOne } from '../../Application';
import { StoreMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyInsertOne = resolveCompanyDecorator(
    STORE_TYPES.UseCaseInsertOne,
    UseCaseInsertOne,
    STORE_TYPES.RepositoryMongo,
    StoreMongoRepository,
    collection
)