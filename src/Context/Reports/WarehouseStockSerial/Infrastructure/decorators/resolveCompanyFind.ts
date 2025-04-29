import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { WAREHOUSE_STOCK_SERIAL_TYPES } from '../IoC';
import { UseCaseFind } from '../../Application';
import { WarehouseStockSerialMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyFind = resolveCompanyDecorator(
    WAREHOUSE_STOCK_SERIAL_TYPES.UseCaseFind,
    UseCaseFind,
    WAREHOUSE_STOCK_SERIAL_TYPES.RepositoryMongo,
    WarehouseStockSerialMongoRepository,
    collection
)