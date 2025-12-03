import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { WAREHOUSE_RETURN_TYPES } from '../IoC';
import { UseCaseFindIndividual } from '../../Application';
import { WarehouseReturnMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyFindIndividual = resolveCompanyDecorator(
    WAREHOUSE_RETURN_TYPES.UseCaseFindIndividual,
    UseCaseFindIndividual,
    WAREHOUSE_RETURN_TYPES.RepositoryMongo,
    WarehouseReturnMongoRepository,
    collection
)