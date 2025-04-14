import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { MOVEMENT_TYPES } from '../IoC';
import { UseCaseGetAll } from '../../Application';
import { MovementMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyGetAll = resolveCompanyDecorator(
    MOVEMENT_TYPES.UseCaseGetAll,
    UseCaseGetAll,
    MOVEMENT_TYPES.RepositoryMongo,
    MovementMongoRepository,
    collection
)