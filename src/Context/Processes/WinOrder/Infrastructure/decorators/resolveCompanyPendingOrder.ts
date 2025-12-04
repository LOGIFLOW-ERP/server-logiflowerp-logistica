import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { WIN_ORDER_TYPES } from '../IoC/types';
import { UseCasePendingOrder } from '../../Application';
import { WINOrderMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyPendingOrder = resolveCompanyDecorator(
    WIN_ORDER_TYPES.UseCasePendingOrder,
    UseCasePendingOrder,
    WIN_ORDER_TYPES.RepositoryMongo,
    WINOrderMongoRepository,
    collection
)