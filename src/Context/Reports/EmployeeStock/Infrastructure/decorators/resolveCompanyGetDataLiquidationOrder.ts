import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { EMPLOYEE_STOCK_TYPES } from '../IoC';
import { UseCaseGetDataLiquidationOrder } from '../../Application';
import { EmployeeStockMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyGetDataLiquidationOrder = resolveCompanyDecorator(
    EMPLOYEE_STOCK_TYPES.GetDataLiquidationOrder,
    UseCaseGetDataLiquidationOrder,
    EMPLOYEE_STOCK_TYPES.RepositoryMongo,
    EmployeeStockMongoRepository,
    collection
)