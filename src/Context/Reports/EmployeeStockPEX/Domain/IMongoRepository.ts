import { IMongoRepository } from '@Shared/Domain'
import { EmployeeStockPEXENTITY } from 'logiflowerp-sdk'

export interface IEmployeeStockPexMongoRepository extends IMongoRepository<EmployeeStockPEXENTITY> { }