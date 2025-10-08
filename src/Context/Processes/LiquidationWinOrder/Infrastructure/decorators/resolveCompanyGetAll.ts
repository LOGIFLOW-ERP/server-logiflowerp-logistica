import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { WIN_ORDER_TYPES } from '@Processes/WinOrder/Infrastructure/IoC/types';
import { LIQUIDATION_WIN_ORDER_TYPES } from '../IoC/types';
import { collection } from '@Processes/WinOrder/Infrastructure/config';
import { WINOrderMongoRepository } from '@Processes/WinOrder/Infrastructure/MongoRepository';
import { UseCaseGetAll } from '@Processes/LiquidationWinOrder/Application/UseCaseGetAll';

export const resolveCompanyGetAll = resolveCompanyDecorator(
    LIQUIDATION_WIN_ORDER_TYPES.UseCaseGetAll,
    UseCaseGetAll,
    WIN_ORDER_TYPES.RepositoryMongo,
    WINOrderMongoRepository,
    collection
)