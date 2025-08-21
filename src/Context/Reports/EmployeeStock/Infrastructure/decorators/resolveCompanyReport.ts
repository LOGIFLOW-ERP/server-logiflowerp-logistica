import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { EMPLOYEE_STOCK_TYPES } from '../IoC';
import { UseCaseReport } from '../../Application';
import { EmployeeStockMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyReport = resolveCompanyDecorator(
    EMPLOYEE_STOCK_TYPES.UseCaseReport,
    UseCaseReport,
    EMPLOYEE_STOCK_TYPES.RepositoryMongo,
    EmployeeStockMongoRepository,
    collection
)