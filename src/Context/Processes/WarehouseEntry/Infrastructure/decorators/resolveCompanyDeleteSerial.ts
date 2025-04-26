import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { WAREHOUSE_ENTRY_TYPES } from '../IoC';
import { UseCaseDeleteSerial } from '../../Application';
import { WarehouseEntryMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyDeleteSerial = resolveCompanyDecorator(
    WAREHOUSE_ENTRY_TYPES.UseCaseDeleteSerial,
    UseCaseDeleteSerial,
    WAREHOUSE_ENTRY_TYPES.RepositoryMongo,
    WarehouseEntryMongoRepository,
    collection
)