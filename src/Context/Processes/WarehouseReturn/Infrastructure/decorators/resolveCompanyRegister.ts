import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { WAREHOUSE_RETURN_TYPES } from '../IoC';
import { UseCaseRegister } from '../../Application';
import { WarehouseReturnMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyRegister = resolveCompanyDecorator(
    WAREHOUSE_RETURN_TYPES.UseCaseRegister,
    UseCaseRegister,
    WAREHOUSE_RETURN_TYPES.RepositoryMongo,
    WarehouseReturnMongoRepository,
    collection
)