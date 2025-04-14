import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { STORE_TYPES } from '../IoC';
import { UseCaseFind } from '../../Application';
import { StoreMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyFind = resolveCompanyDecorator(
    STORE_TYPES.UseCaseFind,
    UseCaseFind,
    STORE_TYPES.RepositoryMongo,
    StoreMongoRepository,
    collection
)