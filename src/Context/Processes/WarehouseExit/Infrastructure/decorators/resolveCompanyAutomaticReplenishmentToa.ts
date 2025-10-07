import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { WAREHOUSE_EXIT_TYPES } from '../IoC';
import { UseCaseAutomaticReplenishmentToa } from '../../Application';
import { WarehouseExitMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyAutomaticReplenishmentToa = resolveCompanyDecorator(
    WAREHOUSE_EXIT_TYPES.UseCaseAutomaticReplenishmentToa,
    UseCaseAutomaticReplenishmentToa,
    WAREHOUSE_EXIT_TYPES.RepositoryMongo,
    WarehouseExitMongoRepository,
    collection
)