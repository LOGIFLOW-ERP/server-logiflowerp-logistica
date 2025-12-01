import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { collection } from '@Processes/WinOrder/Infrastructure/config';
import { WINOrderMongoRepository } from '@Processes/WinOrder/Infrastructure/MongoRepository';
import { LIQUIDATION_WIN_ORDER_TYPES } from '../IoC/types';
import { UseCaseDeleteInventory } from '@Processes/LiquidationWinOrder/Application/UseCaseDeleteInventory';
import { WIN_ORDER_TYPES } from '@Processes/WinOrder/Infrastructure/IoC/types';

export const resolveCompanyDeleteInventory = resolveCompanyDecorator(
    LIQUIDATION_WIN_ORDER_TYPES.UseCaseDeleteInventory,
    UseCaseDeleteInventory,
    WIN_ORDER_TYPES.RepositoryMongo,
    WINOrderMongoRepository,
    collection
)