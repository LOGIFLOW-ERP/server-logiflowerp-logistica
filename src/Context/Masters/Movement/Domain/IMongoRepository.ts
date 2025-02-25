import { IMongoRepository } from '@Shared/Domain'
import { MovementENTITY } from 'logiflowerp-sdk'

export interface IMovementMongoRepository extends IMongoRepository<MovementENTITY> { }