import { ForbiddenException } from '@Config/exception'
import { NextFunction, Request, Response } from 'express'

export function authorizeRoute(req: Request, _res: Response, next: NextFunction) {
    try {
        if (req.userRoot || req.user.root) {
            return next()
        }

        const patronParam = ':_param_'

        const cleanRoutes = (routes: string[]) => routes.map(route => route.replace(/\/$/, "").replace(/\/:[^\/]+/g, `/${patronParam}`).toLowerCase())

        const normalizeUrl = (req: Request) => {
            let url = `${req.method} ${req.originalUrl}`.toLowerCase()
            Object.entries(req.params).forEach(([key, param]) => {
                url = url.replace(param.toLowerCase(), patronParam)
            })
            return url
        }

        const cleanedRoutes = cleanRoutes(req.payloadToken.routes)
        const requestUrl = normalizeUrl(req)

        const exist = cleanedRoutes.some(route => route === requestUrl)

        if (exist) return next()

        next(new ForbiddenException('No autorizado: Esta acción no está permitida según tus permisos', true))
    } catch (error) {
        next(error)
    }
}
