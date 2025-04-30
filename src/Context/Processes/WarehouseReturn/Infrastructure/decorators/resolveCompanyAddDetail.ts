import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { WAREHOUSE_RETURN_TYPES } from '../IoC';
import { UseCaseAddDetail } from '../../Application';
import { WarehouseReturnMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyAddDetail = resolveCompanyDecorator(
    WAREHOUSE_RETURN_TYPES.UseCaseAddDetail,
    UseCaseAddDetail,
    WAREHOUSE_RETURN_TYPES.RepositoryMongo,
    WarehouseReturnMongoRepository,
    collection
)