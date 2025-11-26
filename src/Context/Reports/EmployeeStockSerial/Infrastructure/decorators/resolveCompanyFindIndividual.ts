import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { EMPLOYEE_STOCK_SERIAL_TYPES } from '../IoC';
import { UseCaseFindIndividual } from '../../Application';
import { EmployeeStocSerialMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyFindIndividual = resolveCompanyDecorator(
    EMPLOYEE_STOCK_SERIAL_TYPES.UseCaseFindIndividual,
    UseCaseFindIndividual,
    EMPLOYEE_STOCK_SERIAL_TYPES.RepositoryMongo,
    EmployeeStocSerialMongoRepository,
    collection
)