import {
    BadRequestException,
    InternalServerException,
    NotFoundException
} from '@Config/exception'
import { IParamsTransaction, LogEntity } from '@Shared/Domain'
import { Document } from 'mongodb'

export async function _deleteOne<T extends Document>(params: IParamsTransaction<T>) {

    const { filter, col, session, adapterMongo, client } = params

    if (!filter) {
        throw new BadRequestException('Se requieren parámetros filter')
    }

    const oldDocument = await col.findOne(filter, { session, readPreference: 'primary' })
    if (!oldDocument) {
        throw new NotFoundException('Documento no encontrado')
    }

    const deleteResult = await col.deleteOne(filter, { session })
    if (!deleteResult.acknowledged) {
        throw new InternalServerException('No se pudo eliminar el documento')
    }

    const logDocument: LogEntity<T> = {
        db: col.dbName,
        col: col.collectionName,
        operacion: 'DELETE',
        antiguoValor: oldDocument,
        nuevoValor: null,
        fecha: new Date(),
        idUsuario: ''
    }

    await adapterMongo.insertLog<T>(logDocument, session, client)

    return oldDocument

}