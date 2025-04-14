import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { MOVEMENT_TYPES } from '../IoC';
import { UseCaseFind } from '../../Application';
import { MovementMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyFind = resolveCompanyDecorator(
    MOVEMENT_TYPES.UseCaseFind,
    UseCaseFind,
    MOVEMENT_TYPES.RepositoryMongo,
    MovementMongoRepository,
    collection
)