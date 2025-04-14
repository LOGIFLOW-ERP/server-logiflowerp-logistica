import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { MOVEMENT_TYPES } from '../IoC';
import { UseCaseDeleteOne } from '../../Application';
import { MovementMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyDeleteOne = resolveCompanyDecorator(
    MOVEMENT_TYPES.UseCaseDeleteOne,
    UseCaseDeleteOne,
    MOVEMENT_TYPES.RepositoryMongo,
    MovementMongoRepository,
    collection
)