import { ConflictException, ForbiddenException } from '@Config/exception'
import { NextFunction, Request, Response } from 'express'
import { MongoRepository } from '../Repositories/Mongo'
import { collections, db_root, ProfileENTITY, RootCompanyENTITY, State, SystemOptionENTITY } from 'logiflowerp-sdk'
import { env } from '@Config/env'

export async function authorizeRoute(req: Request, _res: Response, next: NextFunction) {
    try {
        const patronParam = ':_param_'

        const cleanRoutes = (routes: string[]) => routes.map(route => route.replace(/\/$/, "").replace(/\/:[^\/]+/g, `/${patronParam}`).toLowerCase())

        const normalizeUrl = (req: Request) => {
            let url = `${req.method} ${req.originalUrl}`.toLowerCase()
            Object.entries(req.params).forEach(([key, param]) => {
                url = url.replace(param.toLowerCase(), patronParam)
            })
            if (url.includes('?')) {
                const [pathWithParams] = url.split('?')
                return pathWithParams
            }
            return url
        }

        let _idsSystemOption: string[] = []

        if (req.user.root) {
            const repositoryMongoRootCompany = new MongoRepository<RootCompanyENTITY>(db_root, collections.company, req.user)
            const pipelineRootCompany = [{ $match: { code: req.rootCompany.code, state: State.ACTIVO, isDeleted: false } }]
            const rootCompany = await repositoryMongoRootCompany.queryMongoWithRedisMemo(pipelineRootCompany)
            if (rootCompany.length !== 1) {
                throw new ConflictException(`Se encontraron ${rootCompany.length} empresas root con el codigo y estado activo.`);
            }
            _idsSystemOption = rootCompany[0].systemOptions
        } else {
            const repositoryMongoProfile = new MongoRepository<ProfileENTITY>(req.rootCompany.code, collections.profile, req.user)
            const pipelineProfile = [{ $match: { _id: req.payloadToken.personnel._idprofile, state: State.ACTIVO, isDeleted: false } }]
            const profile = await repositoryMongoProfile.queryMongoWithRedisMemo(pipelineProfile)
            if (profile.length !== 1) {
                throw new ConflictException(`Se encontraron ${profile.length} perfiles con el mismo _id y estado activo.`);
            }
            _idsSystemOption = profile[0].systemOptions
        }
        const repositoryMongoSystemOption = new MongoRepository<SystemOptionENTITY>(db_root, collections.systemOption, req.user)
        const pipelineSystemOption = [{ $match: { _id: { $in: _idsSystemOption } } }]
        const SystemOption = await repositoryMongoSystemOption.queryMongoWithRedisMemo(pipelineSystemOption)

        const routes = SystemOption
            .map(el => el.route)
            .filter(route => route !== '')

        const cleanedRoutes = cleanRoutes(routes)
        const requestUrl = normalizeUrl(req)

        const exist = cleanedRoutes.some(route => route === requestUrl)

        if (exist) return next()

        next(new ForbiddenException('No autorizado: Esta acción no está permitida según tus permisos', true))
    } catch (error) {
        next(error)
    }
}
