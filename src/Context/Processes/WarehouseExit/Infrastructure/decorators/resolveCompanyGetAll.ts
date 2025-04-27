import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { WAREHOUSE_EXIT_TYPES } from '../IoC';
import { UseCaseGetAll } from '../../Application';
import { WarehouseExitMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyGetAll = resolveCompanyDecorator(
    WAREHOUSE_EXIT_TYPES.UseCaseGetAll,
    UseCaseGetAll,
    WAREHOUSE_EXIT_TYPES.RepositoryMongo,
    WarehouseExitMongoRepository,
    collection
)