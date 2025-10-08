import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { WAREHOUSE_STOCK_TYPES } from '../IoC';
import { UseCaseFindWithAvailable } from '../../Application';
import { WarehouseStockMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyFindWithAvailable = resolveCompanyDecorator(
    WAREHOUSE_STOCK_TYPES.UseCaseFindWithAvailable,
    UseCaseFindWithAvailable,
    WAREHOUSE_STOCK_TYPES.RepositoryMongo,
    WarehouseStockMongoRepository,
    collection
)