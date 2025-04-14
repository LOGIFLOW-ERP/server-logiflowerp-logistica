import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { STORE_TYPES } from '../IoC';
import { UseCaseUpdateOne } from '../../Application';
import { StoreMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyUpdateOne = resolveCompanyDecorator(
    STORE_TYPES.UseCaseUpdateOne,
    UseCaseUpdateOne,
    STORE_TYPES.RepositoryMongo,
    StoreMongoRepository,
    collection
)