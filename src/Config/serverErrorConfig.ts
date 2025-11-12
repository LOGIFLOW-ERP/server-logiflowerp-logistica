import { Application, ErrorRequestHandler } from 'express'
import { MongoServerError } from 'mongodb'
import { BaseException, ConflictException, InternalServerException } from './exception'

export function serverErrorConfig(app: Application) {

    const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {

        console.error(err)

        if (err instanceof MongoServerError) {
            if (err.code === 11000) {
                const msgDup = parseDuplicateKeyError(err.errorResponse.message ?? '')
                const msg = `El recurso ya existe (${msgDup})`
                res.status(409).send(new ConflictException(msg, true))
                return
            }
        }

        if (err instanceof BaseException) {
            res.status(err.statusCode).json(err)
            return
        }

        res.status(500).json(new InternalServerException('Ocurrió un error inesperado'))

    }

    app.use(errorHandler)

}

const parseDuplicateKeyError = (message: string): string | null => {
    const match = message.match(/dup key:\s*\{([^}]+)\}/)
    if (!match) return null

    const fieldsString = match[1]

    const pairs = fieldsString.split(',').map(p => p.trim())

    const excludeKeys = ['isDeleted', '_id', '__v']

    const formattedFields = pairs
        .map(pair => {
            const [rawKey, rawValue] = pair.split(':').map(s => s.trim())
            const key = rawKey.replace(/["']/g, '')
            const value = rawValue?.replace(/["']/g, '')
            return { key, value }
        })
        .filter(({ key }) => !excludeKeys.includes(key))
        .map(({ key, value }) => `${key} = ${value}`)

    if (formattedFields.length === 0) return null

    return `Duplicado en ${formattedFields.join(', ')}`
}