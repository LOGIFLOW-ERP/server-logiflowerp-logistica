import { ContainerModule } from 'inversify'
import { PRODUCT_PRICE_TYPES } from './types'
import { ProductPriceMongoRepository } from '../MongoRepository'
import {
    UseCaseDeleteOne,
    UseCaseFind,
    UseCaseGetAll,
    UseCaseInsertOne,
    UseCaseUpdateOne,
} from '../../Application'

export const containerModule = new ContainerModule(bind => {
    bind(PRODUCT_PRICE_TYPES.MongoRepository).to(ProductPriceMongoRepository)
    bind(PRODUCT_PRICE_TYPES.UseCaseFind).to(UseCaseFind)
    bind(PRODUCT_PRICE_TYPES.UseCaseGetAll).to(UseCaseGetAll)
    bind(PRODUCT_PRICE_TYPES.UseCaseInsertOne).to(UseCaseInsertOne)
    bind(PRODUCT_PRICE_TYPES.UseCaseUpdateOne).to(UseCaseUpdateOne)
    bind(PRODUCT_PRICE_TYPES.UseCaseDeleteOne).to(UseCaseDeleteOne)
})