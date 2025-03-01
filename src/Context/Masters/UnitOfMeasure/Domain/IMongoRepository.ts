import { IMongoRepository } from '@Shared/Domain'
import { UnitOfMeasureENTITY } from 'logiflowerp-sdk'

export interface IUnitOfMeasureMongoRepository extends IMongoRepository<UnitOfMeasureENTITY> { }