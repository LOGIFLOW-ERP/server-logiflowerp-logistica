import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { EMPLOYEE_STOCK_SERIAL_TYPES } from '../IoC';
import { UseCaseFind } from '../../Application';
import { EmployeeStocSerialMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyFind = resolveCompanyDecorator(
    EMPLOYEE_STOCK_SERIAL_TYPES.UseCaseFind,
    UseCaseFind,
    EMPLOYEE_STOCK_SERIAL_TYPES.RepositoryMongo,
    EmployeeStocSerialMongoRepository,
    collection
)