import { BadRequestException, ContainerGlobal } from '@Config'
import { IFind } from '@Shared/Domain'
import { AdapterMongoDB, AdapterRedis } from '@Shared/Infrastructure/Adapters'
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC/types'
import { Document } from 'mongodb'
import { PassThrough } from 'stream'

export async function queryOnDB_WriteRedis_AndResponse<T extends Document>(params: IFind) {
    const { collection, pipeline, key, res } = params

    if (!key) {
        throw new BadRequestException('Falta key en la consulta')
    }

    const cursor = collection.aggregate<T>(pipeline).stream()
    const stream = new PassThrough()
    const redis = ContainerGlobal.get<AdapterRedis>(SHARED_TYPES.AdapterRedis)
    const mongo = ContainerGlobal.get<AdapterMongoDB>(SHARED_TYPES.AdapterMongoDB)

    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    stream.pipe(res)
    let isFirstChunk = true
    stream.write('[')
    cursor.on('data', async (doc) => {
        const data = JSON.stringify(doc)
        if (!isFirstChunk) {
            stream.write(',')
        }
        stream.write(data)
        isFirstChunk = false
        await redis.client.xAdd(key, '*', { data })
    })
    cursor.on('end', async () => {
        stream.end(']')
        // await mongo.closeConnection()
    })
    cursor.on('error', async (err: any) => {
        console.error('Error leyendo del cursor:', err)
        stream.end(']')
        // await mongo.closeConnection()
        res.status(500).end(JSON.stringify({ statusCode: 500, errorMessage: 'Error leyendo del cursor' }))
    })
    res.on('close', () => {
        console.log('El cliente se desconectó, cerrando flujo. Query on DB write Redis and response')
        cursor.destroy()
    })
}
