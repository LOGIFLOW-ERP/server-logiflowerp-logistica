import { IMongoRepository } from '@Shared/Domain'
import { WarehouseExitENTITY } from 'logiflowerp-sdk'

export interface IWarehouseExitMongoRepository extends IMongoRepository<WarehouseExitENTITY> { }