import { IMongoRepository } from '@Shared/Domain'
import { WarehouseReturnENTITY } from 'logiflowerp-sdk'

export interface IWarehouseReturnMongoRepository extends IMongoRepository<WarehouseReturnENTITY> { }