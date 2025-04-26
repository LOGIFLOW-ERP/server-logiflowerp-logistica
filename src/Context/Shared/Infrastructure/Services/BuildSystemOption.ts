import { inject, injectable } from 'inversify'
import { MongoRepository } from '../Repositories/Mongo'
import { AuthUserDTO, builSystemOption, collections, SystemOptionENTITY } from 'logiflowerp-sdk'
import { UnprocessableEntityException } from '@Config/exception'
import { RouteInfo } from 'inversify-express-utils'
import { CONFIG_TYPES } from '@Config/types'

@injectable()
export class BuildSystemOptionService {

    private mongoRepository: MongoRepository<SystemOptionENTITY>

    constructor(
        @inject(CONFIG_TYPES.Env) private readonly env: Env
    ) {
        this.mongoRepository = new MongoRepository(collections.systemOption, env.DB_ROOT, new AuthUserDTO())
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