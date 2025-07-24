import { ContainerGlobal } from './inversify'
import { getRouteInfo, RouteInfo } from 'inversify-express-utils'
import { env } from './env'
import { styleText } from 'util'
import { UnprocessableEntityException } from './exception'
import { AuthUserDTO, builSystemOption, collections, db_root, SystemOptionENTITY } from 'logiflowerp-sdk'
import { MongoRepository } from '@Shared/Infrastructure/Repositories/Mongo'

export async function registerRoutes(rootPath: string) {
    const routes = getRouteInfo(ContainerGlobal)
    try {
        const repositoryMongoSystemOption = new MongoRepository<SystemOptionENTITY>(db_root, collections.systemOption, new AuthUserDTO())

        const exec = async (rawData: RouteInfo[], rootPath: string, prefix: string) => {
            const dataDB = await repositoryMongoSystemOption.select([{ $match: { prefix, root: false } }])
            const rawDataAux = rawData.filter(e => !e.controller.startsWith('Root'))
            const { _ids, newData } = await builSystemOption({
                dataDB,
                prefix,
                rawData: rawDataAux,
                rootPath,
                UnprocessableEntityException
            })
            if (_ids.length) {
                await repositoryMongoSystemOption.deleteMany({ _id: { $in: _ids } })
            }
            if (newData.length) {
                await repositoryMongoSystemOption.insertMany(newData)
            }
        }

        await exec(routes, rootPath, env.PREFIX)
        console.log(styleText('bgCyan', 'Routes registered successfully.'))
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}