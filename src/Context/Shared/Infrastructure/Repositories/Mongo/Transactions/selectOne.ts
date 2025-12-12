import { ConflictException, NotFoundException } from '@Config/exception';
import { IFind } from '@Shared/Domain';
import { Document } from 'mongodb';

export async function _selectOne<T extends Document>(params: Pick<IFind, 'collection' | 'pipeline'>) {
    const { collection, pipeline } = params
    const documents = await collection.aggregate<T>(pipeline).toArray()

    const map: Record<string, string> = {
        warehouseStockSerials: 'stock almacén series',
    }
    const collectionName = map[collection.collectionName] ?? collection.collectionName

    if (documents.length === 0) {
        throw new NotFoundException(`Documento no encontrado en ${collectionName}.`, true)
    }
    if (documents.length > 1) {
        throw new ConflictException(`Se encontraron múltiples documentos en ${collectionName}.`, true)
    }
    return documents[0]
}