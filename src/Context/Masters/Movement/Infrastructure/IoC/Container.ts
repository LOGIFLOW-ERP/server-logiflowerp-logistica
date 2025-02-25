import { ContainerModule } from 'inversify'
import { MOVEMENT_TYPES } from './types'
import { MovementMongoRepository } from '../MongoRepository'
import {
    UseCaseFind,
    UseCaseGetAll,
} from '../../Application'

export const containerModule = new ContainerModule(bind => {
    bind(MOVEMENT_TYPES.MongoRepository).to(MovementMongoRepository)
    bind(MOVEMENT_TYPES.UseCaseFind).to(UseCaseFind)
    bind(MOVEMENT_TYPES.UseCaseGetAll).to(UseCaseGetAll)
})