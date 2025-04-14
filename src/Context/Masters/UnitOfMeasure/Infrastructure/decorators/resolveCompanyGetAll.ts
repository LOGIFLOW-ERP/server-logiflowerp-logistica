import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { UNIT_OF_MEASURE_TYPES } from '../IoC';
import { UseCaseGetAll } from '../../Application';
import { UnitOfMeasureMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyGetAll = resolveCompanyDecorator(
    UNIT_OF_MEASURE_TYPES.UseCaseGetAll,
    UseCaseGetAll,
    UNIT_OF_MEASURE_TYPES.RepositoryMongo,
    UnitOfMeasureMongoRepository,
    collection
)