import { IMongoRepository } from '@Shared/Domain'
import { EmployeeStockSerialENTITY } from 'logiflowerp-sdk'

export interface IEmployeeStockSerialMongoRepository extends IMongoRepository<EmployeeStockSerialENTITY> { }