import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { WAREHOUSE_ENTRY_TYPES } from '../IoC';
import { UseCaseAddDetail, UseCaseAddDetailBulk, UseCaseAddSerial } from '../../Application';
import { WarehouseEntryMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyAddDetailBulk = resolveCompanyDecorator(
    WAREHOUSE_ENTRY_TYPES.UseCaseAddDetailBulk,
    UseCaseAddDetailBulk,
    WAREHOUSE_ENTRY_TYPES.RepositoryMongo,
    WarehouseEntryMongoRepository,
    collection,
    [
        [WAREHOUSE_ENTRY_TYPES.UseCaseAddDetail, UseCaseAddDetail],
        [WAREHOUSE_ENTRY_TYPES.UseCaseAddSerial, UseCaseAddSerial],
    ]
)