import { CreateIndexesOptions } from 'mongodb'

export interface IndexEntity {
    campos: ICampos[]
    opciones: CreateIndexesOptions
}

interface ICampos {
    nombre: string
    direccion: number
}