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
import crypto from 'crypto'
import { convertDates, db_default, getEmpresa } from 'logiflowerp-sdk'
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC'

const ALGORITHM = 'aes-256-cbc'
const SECRET_KEY = Buffer.from(env.ENCRYPTION_KEY, 'utf8')
const allowedInProd = /^https?:\/\/([a-z0-9-]+\.)*logiflowerp\.com$/i

export async function serverConfig(app: Application) {

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

    authMiddleware(app)

    app.use(json({ limit: '10mb' }))
    app.use(text({ limit: '10mb' }))
    app.use(urlencoded({ limit: '10mb', extended: true }))

    if (env.REQUIRE_ENCRYPTION) {
        app.use(decryptMiddleware)
        app.use(encryptResponse)
    }

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

function authMiddleware(app: Application) {
    app.use(async (req, _res, next) => {
        try {
            let serviceNoAuth: boolean = true

            const publicRoutes: string[] = []
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
        : getEmpresa(req.headers.host)
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

function decryptMiddleware(req: Request, _res: Response, next: NextFunction) {
    try {
        const { iv, encryptedData } = req.body
        if (iv === undefined || encryptedData === undefined) {
            throw new BadRequestException('Datos inválidos: IV o datos cifrados faltantes')
        }
        req.body = decryptData(iv, encryptedData)
        next()
    } catch (error) {
        next(new BadRequestException(`No se pudo descifrar la data: ${(error as Error).message}`))
    }
}

function encryptResponse(_req: Request, res: Response, next: NextFunction) {
    const oldSend = res.send
    res.send = function (data) {
        try {
            data = encryptData(data)
            return oldSend.call(res, data)
        } catch (error) {
            return oldSend.call(res, { error: 'Error al encriptar la respuesta' })
        }
    }
    next()
}

function encryptData(data: any) {
    const iv = crypto.randomBytes(16)

    const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv)
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex')
    encrypted += cipher.final('hex')

    return JSON.stringify({
        iv: iv.toString('hex'),
        encryptedData: encrypted,
    })
}

function decryptData(iv: string, encryptedData: string) {
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, Buffer.from(iv, 'hex'))

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    try {
        return JSON.parse(decrypted)
    } catch (parseError) {
        throw new BadRequestException('Datos descifrados no son un JSON válido')
    }
}
