import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { WAREHOUSE_ENTRY_TYPES } from '../IoC';
import { UseCaseDeleteOne } from '../../Application';
import { WarehouseEntryMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyDeleteOne = resolveCompanyDecorator(
    WAREHOUSE_ENTRY_TYPES.UseCaseDeleteOne,
    UseCaseDeleteOne,
    WAREHOUSE_ENTRY_TYPES.RepositoryMongo,
    WarehouseEntryMongoRepository,
    collection
)