import { IMongoRepository } from '@Shared/Domain'
import { WarehouseEntryENTITY } from 'logiflowerp-sdk'

export interface IWarehouseEntryMongoRepository extends IMongoRepository<WarehouseEntryENTITY> { }