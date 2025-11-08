import { resolveCompanyDecorator } from '@Shared/Infrastructure/decorators';
import { collection } from '@Processes/WinOrder/Infrastructure/config';
import { WINOrderMongoRepository } from '@Processes/WinOrder/Infrastructure/MongoRepository';
import { LIQUIDATION_WIN_ORDER_TYPES } from '../IoC/types';
import { WIN_ORDER_TYPES } from '@Processes/WinOrder/Infrastructure/IoC/types';
import { UseCaseDeletePhotos } from '@Processes/LiquidationWinOrder/Application/UseCaseDeletePhotos';

export const resolveCompanyDeletePhotos = resolveCompanyDecorator(
    LIQUIDATION_WIN_ORDER_TYPES.UseCaseDeletePhotos,
    UseCaseDeletePhotos,
    WIN_ORDER_TYPES.RepositoryMongo,
    WINOrderMongoRepository,
    collection
)