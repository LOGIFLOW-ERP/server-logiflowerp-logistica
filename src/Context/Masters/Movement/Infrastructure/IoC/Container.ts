import { ContainerModule } from 'inversify'
import { MOVEMENT_TYPES } from './types'
import { MovementMongoRepository } from '../MongoRepository'
import {
    UseCaseDeleteOne,
    UseCaseFind,
    UseCaseGetAll,
    UseCaseInsertOne,
    UseCaseUpdateOne,
} from '../../Application'

export const containerModule = new ContainerModule(bind => {
    bind(MOVEMENT_TYPES.MongoRepository).to(MovementMongoRepository)
    bind(MOVEMENT_TYPES.UseCaseFind).to(UseCaseFind)
    bind(MOVEMENT_TYPES.UseCaseGetAll).to(UseCaseGetAll)
    bind(MOVEMENT_TYPES.UseCaseInsertOne).to(UseCaseInsertOne)
    bind(MOVEMENT_TYPES.UseCaseUpdateOne).to(UseCaseUpdateOne)
    bind(MOVEMENT_TYPES.UseCaseDeleteOne).to(UseCaseDeleteOne)
})