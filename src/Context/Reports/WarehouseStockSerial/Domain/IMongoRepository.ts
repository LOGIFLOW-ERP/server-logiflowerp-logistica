import { IMongoRepository } from '@Shared/Domain'
import { WarehouseStockSerialENTITY } from 'logiflowerp-sdk'

export interface IWarehouseStockSerialMongoRepository extends IMongoRepository<WarehouseStockSerialENTITY> { }