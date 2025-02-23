import { ContainerModule } from 'inversify'
import { PRODUCT_TYPES } from './types'
import { ProductMongoRepository } from '../MongoRepository'
import {
    UseCaseFind,
} from '../../Application'

export const containerModule = new ContainerModule(bind => {
    bind(PRODUCT_TYPES.MongoRepository).to(ProductMongoRepository)
    bind(PRODUCT_TYPES.UseCaseFind).to(UseCaseFind)
})