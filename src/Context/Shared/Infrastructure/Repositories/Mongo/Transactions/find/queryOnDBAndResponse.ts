import { ContainerGlobal, InternalServerException } from '@Config'
import { IFind } from '@Shared/Domain'
import { Document } from 'mongodb'
import { AdapterMongoDB } from '@Shared/Infrastructure/Adapters'
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC/types'
import { PassThrough } from 'stream'

export function queryOnDBAndResponse<T extends Document>(params: IFind) {
    const { pipeline, collection, res } = params
    const cursor = collection.aggregate<T>(pipeline).stream()
    const stream = new PassThrough()
    const mongo = ContainerGlobal.get<AdapterMongoDB>(SHARED_TYPES.AdapterMongoDB)

    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    stream.pipe(res)
    let isFirstChunk = true
    stream.write('[')
    cursor.on('data', (doc) => {
        const data = JSON.stringify(doc)
        if (!isFirstChunk) {
            stream.write(',')
        }
        stream.write(data)
        isFirstChunk = false
    })
    cursor.on('end', async () => {
        stream.write(']')
        stream.end()
        // await mongo.closeConnection()
    })
    cursor.on('error', async (err: any) => {
        console.error('Error leyendo del cursor:', err)
        stream.end(']')
        // await mongo.closeConnection()
        res.end(JSON.stringify(new InternalServerException('Error leyendo del cursor')))
    })
    res.on('close', () => {
        cursor.destroy()
    })
}