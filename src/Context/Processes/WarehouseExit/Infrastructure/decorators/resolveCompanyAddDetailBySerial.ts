import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { WAREHOUSE_EXIT_TYPES } from '../IoC';
import {
    UseCaseAddDetail,
    UseCaseAddDetailBySerial,
    UseCaseAddSerial,
    UseCaseEditAmountDetail,
} from '../../Application';
import { WarehouseExitMongoRepository } from '../MongoRepository';
import { collection } from '../config';

export const resolveCompanyAddDetailBySerial = resolveCompanyDecorator(
    WAREHOUSE_EXIT_TYPES.UseCaseAddDetailBySerial,
    UseCaseAddDetailBySerial,
    WAREHOUSE_EXIT_TYPES.RepositoryMongo,
    WarehouseExitMongoRepository,
    collection,
    [
        [WAREHOUSE_EXIT_TYPES.UseCaseAddDetail, UseCaseAddDetail],
        [WAREHOUSE_EXIT_TYPES.UseCaseAddSerial, UseCaseAddSerial],
        [WAREHOUSE_EXIT_TYPES.UseCaseEditAmountDetail, UseCaseEditAmountDetail],
    ]
)