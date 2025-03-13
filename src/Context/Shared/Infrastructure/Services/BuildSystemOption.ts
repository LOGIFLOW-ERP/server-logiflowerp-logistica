import { inject, injectable } from 'inversify'
import { SHARED_TYPES } from '../IoC/types'
import { MongoRepository } from '../Repositories/Mongo'
import { builSystemOption, collections, SystemOptionENTITY } from 'logiflowerp-sdk'
import { UnprocessableEntityException } from '@Config/exception'
import { RouteInfo } from 'inversify-express-utils'

@injectable()
export class BuildSystemOptionService {

    private mongoRepository: MongoRepository<SystemOptionENTITY>

    constructor(
        @inject(SHARED_TYPES.prefix_col_root) private readonly prefix_col_root: string
    ) {
        this.mongoRepository = new MongoRepository(`${this.prefix_col_root}_${collections.systemOptions}`)
    }

    async exec(rawData: RouteInfo[], rootPath: string, prefix: string) {
        const dataDB = await this.mongoRepository.select([{ $match: { prefix, root: false } }])
        const rawDataAux = rawData.filter(e => !e.controller.startsWith('Root'))
        const { _ids, newData } = await builSystemOption({
            dataDB,
            prefix,
            rawData: rawDataAux,
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