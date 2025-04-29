import { IMongoRepository } from '@Shared/Domain'
import { EmployeeStockENTITY } from 'logiflowerp-sdk'

export interface IEmployeeStockMongoRepository extends IMongoRepository<EmployeeStockENTITY> { }