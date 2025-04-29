import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { EMPLOYEE_STOCKPEX_TYPES } from '../IoC';
import { UseCaseFind } from '../../Application';
import { EmployeeStocPexMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyFind = resolveCompanyDecorator(
    EMPLOYEE_STOCKPEX_TYPES.UseCaseFind,
    UseCaseFind,
    EMPLOYEE_STOCKPEX_TYPES.RepositoryMongo,
    EmployeeStocPexMongoRepository,
    collection
)