import { ForbiddenException } from '@Config/exception'
import { NextFunction, Request, Response } from 'express'

export function authRootCompanyMiddleware(req: Request, _res: Response, next: NextFunction) {
    try {
        if (req.userRoot || req.user.root) {
            return next()
        }
        next(new ForbiddenException('No autorizado'))
    } catch (error) {
        next(error)
    }
}
