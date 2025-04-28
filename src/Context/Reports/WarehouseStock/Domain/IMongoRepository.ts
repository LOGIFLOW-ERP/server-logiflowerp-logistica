import { IMongoRepository } from '@Shared/Domain'
import { WarehouseStockENTITY } from 'logiflowerp-sdk'

export interface IWarehouseStockMongoRepository extends IMongoRepository<WarehouseStockENTITY> { }