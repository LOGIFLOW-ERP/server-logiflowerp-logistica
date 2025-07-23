import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { EMPLOYEE_STOCKPEX_TYPES } from '../IoC';
import { UseCaseReport } from '../../Application';
import { EmployeeStocPexMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyReport = resolveCompanyDecorator(
    EMPLOYEE_STOCKPEX_TYPES.UseCaseReport,
    UseCaseReport,
    EMPLOYEE_STOCKPEX_TYPES.RepositoryMongo,
    EmployeeStocPexMongoRepository,
    collection
)