import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { WAREHOUSE_STOCK_TYPES } from '../IoC';
import { UseCaseFind } from '../../Application';
import { WarehouseStockMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyFind = resolveCompanyDecorator(
    WAREHOUSE_STOCK_TYPES.UseCaseFind,
    UseCaseFind,
    WAREHOUSE_STOCK_TYPES.RepositoryMongo,
    WarehouseStockMongoRepository,
    collection
)