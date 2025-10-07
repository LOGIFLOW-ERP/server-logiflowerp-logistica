import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { WIN_ORDER_TYPES } from '../IoC/types';
import { UseCaseFind } from '../../Application';
import { WINOrderMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyFind = resolveCompanyDecorator(
    WIN_ORDER_TYPES.UseCaseFind,
    UseCaseFind,
    WIN_ORDER_TYPES.RepositoryMongo,
    WINOrderMongoRepository,
    collection
)