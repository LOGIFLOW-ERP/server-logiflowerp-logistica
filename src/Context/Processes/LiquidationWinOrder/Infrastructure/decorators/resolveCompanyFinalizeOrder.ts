import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { UseCaseFinalizeOrder } from '../../Application/UseCaseFinalizeOrder';
import { WINOrderMongoRepository } from '@Processes/WinOrder/Infrastructure/MongoRepository';
import { collection } from '@Processes/WinOrder/Infrastructure/config';
import { WIN_ORDER_TYPES } from '@Processes/WinOrder/Infrastructure/IoC/types';
import { LIQUIDATION_WIN_ORDER_TYPES } from '../IoC/types';

export const resolveCompanyFinalizeOrder = resolveCompanyDecorator(
    LIQUIDATION_WIN_ORDER_TYPES.UseCaseFinalizeOrder,
    UseCaseFinalizeOrder,
    WIN_ORDER_TYPES.RepositoryMongo,
    WINOrderMongoRepository,
    collection
)