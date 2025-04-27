import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { WAREHOUSE_EXIT_TYPES } from '../IoC';
import { UseCaseInsertOne } from '../../Application';
import { WarehouseExitMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyInsertOne = resolveCompanyDecorator(
    WAREHOUSE_EXIT_TYPES.UseCaseInsertOne,
    UseCaseInsertOne,
    WAREHOUSE_EXIT_TYPES.RepositoryMongo,
    WarehouseExitMongoRepository,
    collection
)