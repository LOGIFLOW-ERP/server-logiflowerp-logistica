import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { UseCaseProductionZones } from '../../Application';
import { WIN_ORDER_TYPES } from '@Processes/WinOrder/Infrastructure/IoC/types';
import { WINOrderMongoRepository } from '@Processes/WinOrder/Infrastructure/MongoRepository';
import { collection } from '@Processes/WinOrder/Infrastructure/config';
import { WIN_REPORT_TYPES } from '../IoC/types';

export const resolveCompanyProductionZones = resolveCompanyDecorator(
    WIN_REPORT_TYPES.UseCaseProductionZones,
    UseCaseProductionZones,
    WIN_ORDER_TYPES.RepositoryMongo,
    WINOrderMongoRepository,
    collection
)