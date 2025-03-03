import { ContainerModule } from 'inversify'
import { UNIT_OF_MEASURE_TYPES } from './types'
import { UnitOfMeasureMongoRepository } from '../MongoRepository'
import {
    UseCaseDeleteOne,
    UseCaseFind,
    UseCaseGetAll,
    UseCaseInsertOne,
    UseCaseUpdateOne,
} from '../../Application'

export const containerModule = new ContainerModule(bind => {
    bind(UNIT_OF_MEASURE_TYPES.MongoRepository).to(UnitOfMeasureMongoRepository)
    bind(UNIT_OF_MEASURE_TYPES.UseCaseFind).to(UseCaseFind)
    bind(UNIT_OF_MEASURE_TYPES.UseCaseGetAll).to(UseCaseGetAll)
    bind(UNIT_OF_MEASURE_TYPES.UseCaseInsertOne).to(UseCaseInsertOne)
    bind(UNIT_OF_MEASURE_TYPES.UseCaseUpdateOne).to(UseCaseUpdateOne)
    bind(UNIT_OF_MEASURE_TYPES.UseCaseDeleteOne).to(UseCaseDeleteOne)
})