import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { STORE_TYPES } from '../IoC';
import { UseCaseDeleteOne } from '../../Application';
import { StoreMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyDeleteOne = resolveCompanyDecorator(
    STORE_TYPES.UseCaseDeleteOne,
    UseCaseDeleteOne,
    STORE_TYPES.RepositoryMongo,
    StoreMongoRepository,
    collection
)