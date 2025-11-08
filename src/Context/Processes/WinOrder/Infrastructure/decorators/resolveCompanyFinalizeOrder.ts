import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { WIN_ORDER_TYPES } from '../IoC/types';
import { UseCaseFinalizeOrder } from '../../Application';
import { WINOrderMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyFinalizeOrder = resolveCompanyDecorator(
    WIN_ORDER_TYPES.UseCaseFinalizeOrder,
    UseCaseFinalizeOrder,
    WIN_ORDER_TYPES.RepositoryMongo,
    WINOrderMongoRepository,
    collection
)