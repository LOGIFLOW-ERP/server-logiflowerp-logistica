import { IMongoRepository } from '@Shared/Domain'
import { ProductGroupENTITY } from 'logiflowerp-sdk'

export interface IProductGroupMongoRepository extends IMongoRepository<ProductGroupENTITY> { }