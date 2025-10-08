import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { collection } from '@Processes/ToaOrder/Infrastructure/config';
import { TOAOrderMongoRepository } from '@Processes/ToaOrder/Infrastructure/MongoRepository';
import { TOA_ORDER_TYPES } from '@Processes/ToaOrder/Infrastructure/IoC/types';
import { UseCaseAddInventory } from '@Processes/LiquidationOrder/Application/UseCaseAddInventory';
import { LIQUIDATION_ORDER_TYPES } from '../IoC/types';

export const resolveCompanyAddInventory = resolveCompanyDecorator(
    LIQUIDATION_ORDER_TYPES.UseCaseAddInventory,
    UseCaseAddInventory,
    TOA_ORDER_TYPES.RepositoryMongo,
    TOAOrderMongoRepository,
    collection
)