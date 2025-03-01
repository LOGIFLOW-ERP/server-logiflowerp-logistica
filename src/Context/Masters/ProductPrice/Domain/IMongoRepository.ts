import { IMongoRepository } from '@Shared/Domain'
import { ProductPriceENTITY } from 'logiflowerp-sdk'

export interface IProductPriceMongoRepository extends IMongoRepository<ProductPriceENTITY> { }