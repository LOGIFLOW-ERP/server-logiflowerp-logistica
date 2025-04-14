import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { MOVEMENT_TYPES } from '../IoC';
import { UseCaseInsertOne } from '../../Application';
import { MovementMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyInsertOne = resolveCompanyDecorator(
    MOVEMENT_TYPES.UseCaseInsertOne,
    UseCaseInsertOne,
    MOVEMENT_TYPES.RepositoryMongo,
    MovementMongoRepository,
    collection
)