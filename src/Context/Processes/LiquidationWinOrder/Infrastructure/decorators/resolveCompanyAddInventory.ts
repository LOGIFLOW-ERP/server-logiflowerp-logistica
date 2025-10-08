import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { collection } from '@Processes/WinOrder/Infrastructure/config';
import { WINOrderMongoRepository } from '@Processes/WinOrder/Infrastructure/MongoRepository';
import { LIQUIDATION_WIN_ORDER_TYPES } from '../IoC/types';
import { UseCaseAddInventory } from '@Processes/LiquidationWinOrder/Application/UseCaseAddInventory';
import { WIN_ORDER_TYPES } from '@Processes/WinOrder/Infrastructure/IoC/types';

export const resolveCompanyAddInventory = resolveCompanyDecorator(
    LIQUIDATION_WIN_ORDER_TYPES.UseCaseAddInventory,
    UseCaseAddInventory,
    WIN_ORDER_TYPES.RepositoryMongo,
    WINOrderMongoRepository,
    collection
)