import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { CMS_ORDER_TYPES } from '../IoC/types';
import { UseCaseSave } from '../../Application';
import { CMSOrderMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanySave = resolveCompanyDecorator(
    CMS_ORDER_TYPES.UseCaseSave,
    UseCaseSave,
    CMS_ORDER_TYPES.RepositoryMongo,
    CMSOrderMongoRepository,
    collection
)