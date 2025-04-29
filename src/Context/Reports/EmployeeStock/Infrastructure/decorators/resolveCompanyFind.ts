import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { EMPLOYEE_STOCK_TYPES } from '../IoC';
import { UseCaseFind } from '../../Application';
import { EmployeeStockMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyFind = resolveCompanyDecorator(
    EMPLOYEE_STOCK_TYPES.UseCaseFind,
    UseCaseFind,
    EMPLOYEE_STOCK_TYPES.RepositoryMongo,
    EmployeeStockMongoRepository,
    collection
)