import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { WAREHOUSE_EXIT_TYPES } from '../IoC';
import { UseCaseFind } from '../../Application';
import { WarehouseExitMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyFind = resolveCompanyDecorator(
    WAREHOUSE_EXIT_TYPES.UseCaseFind,
    UseCaseFind,
    WAREHOUSE_EXIT_TYPES.RepositoryMongo,
    WarehouseExitMongoRepository,
    collection
)