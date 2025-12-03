import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { UseCaseProduction } from '../../Application';
import { WIN_ORDER_TYPES } from '@Processes/WinOrder/Infrastructure/IoC/types';
import { WINOrderMongoRepository } from '@Processes/WinOrder/Infrastructure/MongoRepository';
import { collection } from '@Processes/WinOrder/Infrastructure/config';
import { WIN_REPORT_TYPES } from '../IoC/types';

export const resolveCompanyProduction = resolveCompanyDecorator(
    WIN_REPORT_TYPES.UseCaseProduction,
    UseCaseProduction,
    WIN_ORDER_TYPES.RepositoryMongo,
    WINOrderMongoRepository,
    collection
)