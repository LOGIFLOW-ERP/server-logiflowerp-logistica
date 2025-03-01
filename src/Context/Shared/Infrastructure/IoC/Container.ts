import { ContainerModule } from 'inversify'
import { SHARED_TYPES } from './types'
import {
    AdapterApiRequest,
    AdapterMail,
    AdapterMongoDB,
    AdapterRabbitMQ,
    AdapterRedis,
    AdapterSocket,
    AdapterToken
} from '../Adapters'
import { database_logiflow } from '../config'
import { collections } from 'logiflowerp-sdk'
import { BuildSystemOptionService } from '../Services'

export const containerModule = new ContainerModule(bind => {
    bind(SHARED_TYPES.AdapterToken).to(AdapterToken).inSingletonScope()
    bind(SHARED_TYPES.AdapterMongoDB).to(AdapterMongoDB).inSingletonScope()
    bind(SHARED_TYPES.AdapterSocket).to(AdapterSocket).inSingletonScope()
    bind(SHARED_TYPES.AdapterRedis).to(AdapterRedis).inSingletonScope()
    bind(SHARED_TYPES.AdapterMail).to(AdapterMail).inSingletonScope()
    bind(SHARED_TYPES.AdapterApiRequest).to(AdapterApiRequest).inSingletonScope()
    bind(SHARED_TYPES.AdapterRabbitMQ).to(AdapterRabbitMQ).inSingletonScope()
    bind(SHARED_TYPES.BuildSystemOptionService).to(BuildSystemOptionService)
    bind(SHARED_TYPES.database_logiflow).toConstantValue(database_logiflow)
    bind(SHARED_TYPES.collection_endpoint).toConstantValue(collections.endpoints)
    bind(SHARED_TYPES.collection_products).toConstantValue(collections.products)
    bind(SHARED_TYPES.collection_systemOptions).toConstantValue(collections.systemOptions)
    bind(SHARED_TYPES.collection_movements).toConstantValue(collections.movements)
    bind(SHARED_TYPES.collection_productGroups).toConstantValue(collections.productGroups)
    bind(SHARED_TYPES.collection_productPrices).toConstantValue(collections.productPrices)
    // bind(Worker).to(Worker).inSingletonScope()
})