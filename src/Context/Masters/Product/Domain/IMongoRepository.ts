import { IMongoRepository } from '@Shared/Domain'
import { ProductENTITY } from 'logiflowerp-sdk'

export interface IProductMongoRepository extends IMongoRepository<ProductENTITY> { }