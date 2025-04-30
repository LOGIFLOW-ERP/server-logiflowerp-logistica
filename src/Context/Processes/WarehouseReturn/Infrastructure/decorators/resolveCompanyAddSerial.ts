import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { WAREHOUSE_RETURN_TYPES } from '../IoC';
import { UseCaseAddSerial } from '../../Application';
import { WarehouseReturnMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyAddSerial = resolveCompanyDecorator(
    WAREHOUSE_RETURN_TYPES.UseCaseAddSerial,
    UseCaseAddSerial,
    WAREHOUSE_RETURN_TYPES.RepositoryMongo,
    WarehouseReturnMongoRepository,
    collection
)