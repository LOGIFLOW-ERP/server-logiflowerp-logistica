import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { UNIT_OF_MEASURE_TYPES } from '../IoC';
import { UseCaseFind } from '../../Application';
import { UnitOfMeasureMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyFind = resolveCompanyDecorator(
    UNIT_OF_MEASURE_TYPES.UseCaseFind,
    UseCaseFind,
    UNIT_OF_MEASURE_TYPES.RepositoryMongo,
    UnitOfMeasureMongoRepository,
    collection
)