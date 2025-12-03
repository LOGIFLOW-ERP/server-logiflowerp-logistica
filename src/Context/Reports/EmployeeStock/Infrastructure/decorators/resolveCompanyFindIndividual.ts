import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { EMPLOYEE_STOCK_TYPES } from '../IoC';
import { UseCaseFindIndividual } from '../../Application';
import { EmployeeStockMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyFindIndividual = resolveCompanyDecorator(
    EMPLOYEE_STOCK_TYPES.UseCaseFindIndividual,
    UseCaseFindIndividual,
    EMPLOYEE_STOCK_TYPES.RepositoryMongo,
    EmployeeStockMongoRepository,
    collection
)