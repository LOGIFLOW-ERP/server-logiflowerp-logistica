import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { WAREHOUSE_EXIT_TYPES } from '../IoC';
import { UseCaseAutomaticReplenishmentWin } from '../../Application';
import { WarehouseExitMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyAutomaticReplenishmentWin = resolveCompanyDecorator(
    WAREHOUSE_EXIT_TYPES.UseCaseAutomaticReplenishmentWin,
    UseCaseAutomaticReplenishmentWin,
    WAREHOUSE_EXIT_TYPES.RepositoryMongo,
    WarehouseExitMongoRepository,
    collection
)