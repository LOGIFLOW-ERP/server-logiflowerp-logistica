import { IMongoRepository } from '@Shared/Domain'
import { CMSOrderENTITY } from 'logiflowerp-sdk'

export interface ICMSOrderMongoRepository extends IMongoRepository<CMSOrderENTITY> { }