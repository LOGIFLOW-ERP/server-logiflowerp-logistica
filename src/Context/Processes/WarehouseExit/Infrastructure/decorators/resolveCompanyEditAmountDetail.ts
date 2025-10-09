import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { WAREHOUSE_EXIT_TYPES } from '../IoC';
import { UseCaseEditAmountDetail } from '../../Application';
import { WarehouseExitMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyEditAmountDetail = resolveCompanyDecorator(
    WAREHOUSE_EXIT_TYPES.UseCaseEditAmountDetail,
    UseCaseEditAmountDetail,
    WAREHOUSE_EXIT_TYPES.RepositoryMongo,
    WarehouseExitMongoRepository,
    collection
)