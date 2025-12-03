import {
    Application,
    json,
    NextFunction,
    Request,
    Response,
    text,
    urlencoded
} from 'express'
import cookieParser from 'cookie-parser'
import { env } from './env'
import helmet from 'helmet'
import compression from 'compression'
import cors from 'cors'
import {
    BadRequestException,
    UnauthorizedException
} from './exception'
import { ContainerGlobal } from './inversify'
import { AdapterToken } from '@Shared/Infrastructure/Adapters'
import { convertDates, db_default, getEmpresa } from 'logiflowerp-sdk'
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC'

const allowedInProd = /^https?:\/\/([a-z0-9-]+\.)*logiflowerp\.com$/i

export async function serverConfig(app: Application, rootPath: string) {

    app.use(resolveTenantBySubdomain)
    app.use(customLogger)
    app.use(cookieParser())
    app.use(helmet())
    app.use(compression())

    app.disable('x-powered-by')

    app.use(cors({
        origin: (origin, callback) => {
            if (!origin) {
                return callback(null, true)
            }
            // if (whitelist.some(org => org.toLowerCase() === origin?.toLowerCase())) {
            //     return callback(null, true)
            // }
            if (env.NODE_ENV === 'production') {
                if (allowedInProd.test(origin)) {
                    return callback(null, true)
                }
            } else {
                if (
                    origin.startsWith('http://localhost') ||
                    allowedInProd.test(origin)
                ) {
                    return callback(null, true)
                }
            }
            callback(new Error('Not allowed by CORS'))
        },
        credentials: true
    }))

    authMiddleware(app, rootPath)

    app.use(json({ limit: '10mb' }))
    app.use(text({ limit: '10mb' }))
    app.use(urlencoded({ limit: '10mb', extended: true }))

    app.use(convertDatesMiddleware)

}

function customLogger(req: Request, res: Response, next: NextFunction) {

    const start = Date.now()

    res.on('finish', () => {
        const duration = Date.now() - start
        const status = res.statusCode;

        let color = '\x1b[32m%s\x1b[0m'
        if (status >= 400 && status < 500) color = '\x1b[33m%s\x1b[0m'
        if (status >= 500) color = '\x1b[31m%s\x1b[0m'

        console.log(color, `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`)
    })

    next()

}

function authMiddleware(app: Application, rootPath: string) {
    app.use(async (req, _res, next) => {
        try {
            let serviceNoAuth: boolean = true

            const publicRoutes: string[] = [
                // `${rootPath}/reports/winReports/production`,
            ]
            const url = req.originalUrl.toLowerCase()

            if (publicRoutes.some(route => route.toLowerCase() === url)) {
                serviceNoAuth = false
            }

            if (!serviceNoAuth) return next()

            const token = req.cookies.authToken || req.headers['authorization']

            if (!token) {
                return next(new UnauthorizedException('No autorizado, token faltante'))
            }

            const adapterToken = ContainerGlobal.get<AdapterToken>(SHARED_TYPES.AdapterToken)
            const decoded = await adapterToken.verify(token)

            if (!decoded) {
                return next(new UnauthorizedException('Token inválido o expirado'))
            }

            req.payloadToken = decoded
            req.user = decoded.user
            req.rootCompany = decoded.rootCompany

            next()
        } catch (error) {
            next(error)
        }
    })
}

function resolveTenantBySubdomain(req: Request, _res: Response, next: NextFunction) {
    const subdomain = env.NODE_ENV === 'development'
        ? db_default
        : getEmpresa(req.headers.origin)
    if (!subdomain) {
        return next(new BadRequestException('Subdominio no encontrado'))
    }
    req.tenant = subdomain.toUpperCase()
    next()
}

function convertDatesMiddleware(req: Request, _res: Response, next: NextFunction) {
    convertDates(req.body)
    next()
}
