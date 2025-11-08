import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { WIN_ORDER_TYPES } from '../IoC/types';
import { UseCaseChangeInternalState } from '../../Application';
import { WINOrderMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyChangeInternalState = resolveCompanyDecorator(
    WIN_ORDER_TYPES.UseCaseChangeInternalState,
    UseCaseChangeInternalState,
    WIN_ORDER_TYPES.RepositoryMongo,
    WINOrderMongoRepository,
    collection
)