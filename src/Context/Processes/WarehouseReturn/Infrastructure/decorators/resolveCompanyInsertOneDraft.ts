import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { WAREHOUSE_RETURN_TYPES } from '../IoC';
import { UseCaseInsertOneDraft } from '../../Application';
import { WarehouseReturnMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyInsertOneDraft = resolveCompanyDecorator(
    WAREHOUSE_RETURN_TYPES.UseCaseInsertOneDraft,
    UseCaseInsertOneDraft,
    WAREHOUSE_RETURN_TYPES.RepositoryMongo,
    WarehouseReturnMongoRepository,
    collection
)