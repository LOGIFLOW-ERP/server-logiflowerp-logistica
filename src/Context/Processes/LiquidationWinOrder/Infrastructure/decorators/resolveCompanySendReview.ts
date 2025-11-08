import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { collection } from '@Processes/WinOrder/Infrastructure/config';
import { WINOrderMongoRepository } from '@Processes/WinOrder/Infrastructure/MongoRepository';
import { LIQUIDATION_WIN_ORDER_TYPES } from '../IoC/types';
import { WIN_ORDER_TYPES } from '@Processes/WinOrder/Infrastructure/IoC/types';
import { UseCaseSendReview } from '@Processes/LiquidationWinOrder/Application/UseCaseSendReview';

export const resolveCompanySendReview = resolveCompanyDecorator(
    LIQUIDATION_WIN_ORDER_TYPES.UseCaseSendReview,
    UseCaseSendReview,
    WIN_ORDER_TYPES.RepositoryMongo,
    WINOrderMongoRepository,
    collection
)