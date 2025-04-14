import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { UNIT_OF_MEASURE_TYPES } from '../IoC';
import { UseCaseDeleteOne } from '../../Application';
import { UnitOfMeasureMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyDeleteOne = resolveCompanyDecorator(
    UNIT_OF_MEASURE_TYPES.UseCaseDeleteOne,
    UseCaseDeleteOne,
    UNIT_OF_MEASURE_TYPES.RepositoryMongo,
    UnitOfMeasureMongoRepository,
    collection
)