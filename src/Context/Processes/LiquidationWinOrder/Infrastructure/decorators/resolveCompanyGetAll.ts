import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { TOA_ORDER_TYPES } from '@Processes/ToaOrder/Infrastructure/IoC/types';
import { LIQUIDATION_WIN_ORDER_TYPES } from '../IoC/types';
import { collection } from '@Processes/ToaOrder/Infrastructure/config';
import { TOAOrderMongoRepository } from '@Processes/ToaOrder/Infrastructure/MongoRepository';
import { UseCaseGetAll } from '@Processes/LiquidationOrder/Application/UseCaseGetAll';

export const resolveCompanyGetAll = resolveCompanyDecorator(
    LIQUIDATION_WIN_ORDER_TYPES.UseCaseGetAll,
    UseCaseGetAll,
    TOA_ORDER_TYPES.RepositoryMongo,
    TOAOrderMongoRepository,
    collection
)