import { WithId } from 'mongodb'

export interface LogEntity<T> {
    db: string
    col: string
    operacion: 'INSERT' | 'UPDATE'
    antiguoValor: WithId<T> | WithId<T>[] | null
    nuevoValor: WithId<T> | WithId<T>[] | null
    fecha: Date
    idUsuario: string
}
