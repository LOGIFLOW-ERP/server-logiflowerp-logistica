import { InternalServerException } from '@Config/exception'
import { ContainerGlobal } from '@Config/inversify'
import { IFind } from '@Shared/Domain'
import { AdapterRedis } from '@Shared/Infrastructure/Adapters'
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC'
import { Document } from 'mongodb'

export async function _queryMongoWithRedisMemo<T extends Document>(params: Pick<IFind, 'collection' | 'pipeline'>) {

    const { collection, pipeline } = params

    const key = `${collection.dbName}--${collection.collectionName}--${JSON.stringify(pipeline)}`
    const redis = ContainerGlobal.get<AdapterRedis>(SHARED_TYPES.AdapterRedis)

    const exist = await redis.client.xLen(key)

    if (exist) {
        const result = await redis.client.xRead({ key, id: '0-0' })
        if (!result) {
            throw new InternalServerException(`No se encontraron datos en el stream de Redis para la clave solicitada ${key}.`);
        }
        return result.flatMap(e =>
            e.messages.map(m => JSON.parse(m.message.data) as T)
        )
    } else {
        const documents = await collection.aggregate<T>(pipeline).toArray()
        for (const doc of documents) {
            const data = JSON.stringify(doc)
            await redis.client.xAdd(key, '*', { data })
        }
        return documents
    }

}
