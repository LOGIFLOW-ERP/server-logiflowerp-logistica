import { ContainerGlobal } from './inversify'
import { getRouteInfo } from 'inversify-express-utils'
import { env } from './env'
import { BuildSystemOptionService } from '@Shared/Infrastructure/Services'
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC'

export async function registerRoutes(rootPath: string) {
    try {
        const routes = getRouteInfo(ContainerGlobal)
        // await ContainerGlobal.get<UseCaseSaveRoutes>(ENDPOINT_TYPES.UseCaseSaveRoutes).exec(routes, rootPath)
        await ContainerGlobal.get<BuildSystemOptionService>(SHARED_TYPES.BuildSystemOptionService).exec(routes, rootPath, env.PREFIX)
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}