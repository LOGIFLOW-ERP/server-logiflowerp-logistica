import { IMongoRepository } from '@Shared/Domain'
import { StoreENTITY } from 'logiflowerp-sdk'

export interface IStoreMongoRepository extends IMongoRepository<StoreENTITY> { }