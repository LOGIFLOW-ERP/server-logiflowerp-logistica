import { ENDPOINT_TYPES } from '@Masters/Endpoint/Infrastructure/IoC/types'
import { ContainerGlobal } from './inversify'
import { UseCaseSaveRoutes } from '@Masters/Endpoint/Application'
import { getRouteInfo } from 'inversify-express-utils'
import { UseCaseSave } from '@Masters/SystemOption/Application'
import { SYSTEM_OPTION_TYPES } from '@Masters/SystemOption/Infrastructure/IoC'
import { env } from './env'

export async function registerRoutes(rootPath: string) {
    const routes = getRouteInfo(ContainerGlobal)
    try {
        await ContainerGlobal.get<UseCaseSaveRoutes>(ENDPOINT_TYPES.UseCaseSaveRoutes).exec(routes, rootPath)
        await ContainerGlobal.get<UseCaseSave>(SYSTEM_OPTION_TYPES.UseCaseSave).exec(routes, rootPath, env.PREFIX)
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}