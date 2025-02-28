import { ContainerModule } from 'inversify'
import { PRODUCT_GROUP_TYPES } from './types'
import { ProductGroupMongoRepository } from '../MongoRepository'
import {
    UseCaseDeleteOne,
    UseCaseFind,
    UseCaseGetAll,
    UseCaseInsertOne,
    UseCaseUpdateOne,
} from '../../Application'

export const containerModule = new ContainerModule(bind => {
    bind(PRODUCT_GROUP_TYPES.MongoRepository).to(ProductGroupMongoRepository)
    bind(PRODUCT_GROUP_TYPES.UseCaseFind).to(UseCaseFind)
    bind(PRODUCT_GROUP_TYPES.UseCaseGetAll).to(UseCaseGetAll)
    bind(PRODUCT_GROUP_TYPES.UseCaseInsertOne).to(UseCaseInsertOne)
    bind(PRODUCT_GROUP_TYPES.UseCaseUpdateOne).to(UseCaseUpdateOne)
    bind(PRODUCT_GROUP_TYPES.UseCaseDeleteOne).to(UseCaseDeleteOne)
})