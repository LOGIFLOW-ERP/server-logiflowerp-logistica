import { ConflictException, NotFoundException } from '@Config/exception';
import { IFind } from '@Shared/Domain';
import { Document } from 'mongodb';

export async function _selectOne<T extends Document>(params: Pick<IFind, 'collection' | 'pipeline'>) {
    const { collection, pipeline } = params
    const documents = await collection.aggregate<T>(pipeline).toArray()
    if (documents.length === 0) {
        throw new NotFoundException('Documento no encontrado')
    }
    if (documents.length > 1) {
        throw new ConflictException('Se encontraron múltiples documentos')
    }
    return documents[0]
}