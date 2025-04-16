import { ForbiddenException } from '@Config/exception';
import { NextFunction, Request, Response } from 'express';

export function authRootMiddleware(req: Request, _res: Response, next: NextFunction) {
    try {
        if (!req.userRoot) {
            return next(new ForbiddenException('No autorizado'))
        }
        next()
    } catch (error) {
        next(error)
    }
}