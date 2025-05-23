import { Document, WithId } from 'mongodb'
import { IParamsTransaction } from './IParamsTransaction'

export interface IMapTransaction {
    insertOne<T extends Document>(params: IParamsTransaction<T>): Promise<WithId<T>>
    updateOne<T extends Document>(params: IParamsTransaction<T>): Promise<WithId<T>>
    deleteOne<T extends Document>(params: IParamsTransaction<T>): Promise<WithId<T>>
    insertMany<T extends Document>(params: IParamsTransaction<T>): Promise<WithId<T>[]>
}