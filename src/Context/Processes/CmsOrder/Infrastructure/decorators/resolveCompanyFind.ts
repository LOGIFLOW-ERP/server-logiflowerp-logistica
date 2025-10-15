import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { CMS_ORDER_TYPES } from '../IoC/types';
import { UseCaseFind } from '../../Application';
import { CMSOrderMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyFind = resolveCompanyDecorator(
    CMS_ORDER_TYPES.UseCaseFind,
    UseCaseFind,
    CMS_ORDER_TYPES.RepositoryMongo,
    CMSOrderMongoRepository,
    collection
)