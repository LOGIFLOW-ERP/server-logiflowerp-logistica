import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { EMPLOYEE_STOCK_TYPES } from '../IoC';
import { UseCaseGetDataLiquidationWinOrder } from '../../Application';
import { EmployeeStockMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyGetDataLiquidationWinOrder = resolveCompanyDecorator(
    EMPLOYEE_STOCK_TYPES.GetDataLiquidationWinOrder,
    UseCaseGetDataLiquidationWinOrder,
    EMPLOYEE_STOCK_TYPES.RepositoryMongo,
    EmployeeStockMongoRepository,
    collection
)