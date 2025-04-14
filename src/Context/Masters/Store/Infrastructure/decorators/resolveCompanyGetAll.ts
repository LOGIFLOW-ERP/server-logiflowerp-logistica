import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { STORE_TYPES } from '../IoC';
import { UseCaseGetAll } from '../../Application';
import { StoreMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyGetAll = resolveCompanyDecorator(
    STORE_TYPES.UseCaseGetAll,
    UseCaseGetAll,
    STORE_TYPES.RepositoryMongo,
    StoreMongoRepository,
    collection
)