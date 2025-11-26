import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { WAREHOUSE_STOCK_SERIAL_TYPES } from '../IoC';
import { UseCaseSerialTracking } from '../../Application';
import { WarehouseStockSerialMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanySerialTracking = resolveCompanyDecorator(
    WAREHOUSE_STOCK_SERIAL_TYPES.UseCaseSerialTracking,
    UseCaseSerialTracking,
    WAREHOUSE_STOCK_SERIAL_TYPES.RepositoryMongo,
    WarehouseStockSerialMongoRepository,
    collection
)