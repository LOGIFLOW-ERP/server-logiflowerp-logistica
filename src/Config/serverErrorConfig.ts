import { Application, ErrorRequestHandler } from 'express'
import { MongoServerError } from 'mongodb'
import { BaseException, ConflictException, InternalServerException } from './exception'
import { parseDuplicateKeyError } from 'logiflowerp-sdk'

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
