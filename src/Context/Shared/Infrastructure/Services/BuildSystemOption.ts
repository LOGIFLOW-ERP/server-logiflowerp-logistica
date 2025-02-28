import { inject, injectable } from 'inversify'
import { SHARED_TYPES } from '../IoC/types'
import { MongoRepository } from '../Repositories/Mongo'
import { builSystemOption, SystemOptionENTITY } from 'logiflowerp-sdk'
import { UnprocessableEntityException } from '@Config/exception'
import { RouteInfo } from 'inversify-express-utils'

@injectable()
export class BuildSystemOptionService {

    private mongoRepository: MongoRepository<SystemOptionENTITY>

    constructor(
        @inject(SHARED_TYPES.collection_systemOptions) private readonly col_systemOptions: string,
        @inject(SHARED_TYPES.database_logiflow) private readonly db_logiflow: string,
    ) {
        this.mongoRepository = new MongoRepository(this.db_logiflow, this.col_systemOptions)
    }

    async exec(rawData: RouteInfo[], rootPath: string, prefix: string) {
        const dataDB = await this.mongoRepository.select([{ $match: { prefix } }])
        const { _ids, newData } = await builSystemOption({
            dataDB,
            prefix,
            rawData,
            rootPath,
            UnprocessableEntityException
        })
        if (_ids.length) {
            await this.mongoRepository.deleteMany({ _id: { $in: _ids } })
        }
        if (newData.length) {
            await this.mongoRepository.insertMany(newData)
        }
    }

}