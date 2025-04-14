import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { UNIT_OF_MEASURE_TYPES } from '../IoC';
import { UseCaseInsertOne } from '../../Application';
import { UnitOfMeasureMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyInsertOne = resolveCompanyDecorator(
    UNIT_OF_MEASURE_TYPES.UseCaseInsertOne,
    UseCaseInsertOne,
    UNIT_OF_MEASURE_TYPES.RepositoryMongo,
    UnitOfMeasureMongoRepository,
    collection
)