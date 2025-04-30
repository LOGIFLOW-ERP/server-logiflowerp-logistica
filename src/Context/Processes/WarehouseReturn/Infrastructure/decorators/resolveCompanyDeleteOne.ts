import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { WAREHOUSE_RETURN_TYPES } from '../IoC';
import { UseCaseDeleteOne } from '../../Application';
import { WarehouseReturnMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyDeleteOne = resolveCompanyDecorator(
    WAREHOUSE_RETURN_TYPES.UseCaseDeleteOne,
    UseCaseDeleteOne,
    WAREHOUSE_RETURN_TYPES.RepositoryMongo,
    WarehouseReturnMongoRepository,
    collection
)