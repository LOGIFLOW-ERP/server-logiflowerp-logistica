import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { WAREHOUSE_ENTRY_TYPES } from '../IoC';
import { UseCaseDeleteDetail } from '../../Application';
import { WarehouseEntryMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyDeleteDetail = resolveCompanyDecorator(
    WAREHOUSE_ENTRY_TYPES.UseCaseDeleteDetail,
    UseCaseDeleteDetail,
    WAREHOUSE_ENTRY_TYPES.RepositoryMongo,
    WarehouseEntryMongoRepository,
    collection
)