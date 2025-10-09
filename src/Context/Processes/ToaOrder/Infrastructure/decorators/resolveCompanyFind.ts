import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { TOA_ORDER_TYPES } from '../IoC/types';
import { UseCaseFind } from '../../Application';
import { TOAOrderMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyFind = resolveCompanyDecorator(
    TOA_ORDER_TYPES.UseCaseFind,
    UseCaseFind,
    TOA_ORDER_TYPES.RepositoryMongo,
    TOAOrderMongoRepository,
    collection
)