import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { UNIT_OF_MEASURE_TYPES } from '../IoC';
import { UseCaseUpdateOne } from '../../Application';
import { UnitOfMeasureMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyUpdateOne = resolveCompanyDecorator(
    UNIT_OF_MEASURE_TYPES.UseCaseUpdateOne,
    UseCaseUpdateOne,
    UNIT_OF_MEASURE_TYPES.RepositoryMongo,
    UnitOfMeasureMongoRepository,
    collection
)