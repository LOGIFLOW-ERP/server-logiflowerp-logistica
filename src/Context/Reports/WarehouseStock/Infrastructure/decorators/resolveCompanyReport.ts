import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { WAREHOUSE_STOCK_TYPES } from '../IoC';
import { UseCaseReport } from '../../Application';
import { WarehouseStockMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyReport = resolveCompanyDecorator(
    WAREHOUSE_STOCK_TYPES.UseCaseReport,
    UseCaseReport,
    WAREHOUSE_STOCK_TYPES.RepositoryMongo,
    WarehouseStockMongoRepository,
    collection
)