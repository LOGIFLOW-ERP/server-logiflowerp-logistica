import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { WAREHOUSE_ENTRY_TYPES } from '../IoC';
import { UseCaseAddSerial } from '../../Application';
import { WarehouseEntryMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyAddSerial = resolveCompanyDecorator(
    WAREHOUSE_ENTRY_TYPES.UseCaseAddSerial,
    UseCaseAddSerial,
    WAREHOUSE_ENTRY_TYPES.RepositoryMongo,
    WarehouseEntryMongoRepository,
    collection
)