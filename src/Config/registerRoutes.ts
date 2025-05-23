import { ContainerGlobal } from './inversify'
import { getRouteInfo } from 'inversify-express-utils'
import { env } from './env'
import { BuildSystemOptionService } from '@Shared/Infrastructure/Services'
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC'

export async function registerRoutes(rootPath: string) {
    const routes = getRouteInfo(ContainerGlobal)
    try {
        await ContainerGlobal.get<BuildSystemOptionService>(SHARED_TYPES.BuildSystemOptionService).exec(routes, rootPath, env.PREFIX)
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}