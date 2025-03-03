import { ContainerModule } from 'inversify'
import { STORE_TYPESENTITY } from './types'
import { StoreMongoRepository } from '../MongoRepository'
import {
    UseCaseDeleteOne,
    UseCaseFind,
    UseCaseGetAll,
    UseCaseInsertOne,
    UseCaseUpdateOne,
} from '../../Application'

export const containerModule = new ContainerModule(bind => {
    bind(STORE_TYPESENTITY.MongoRepository).to(StoreMongoRepository)
    bind(STORE_TYPESENTITY.UseCaseFind).to(UseCaseFind)
    bind(STORE_TYPESENTITY.UseCaseGetAll).to(UseCaseGetAll)
    bind(STORE_TYPESENTITY.UseCaseInsertOne).to(UseCaseInsertOne)
    bind(STORE_TYPESENTITY.UseCaseUpdateOne).to(UseCaseUpdateOne)
    bind(STORE_TYPESENTITY.UseCaseDeleteOne).to(UseCaseDeleteOne)
})