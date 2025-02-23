import { Request, Response } from 'express'
import {
    Document,
    Filter,
    OptionalUnlessRequiredId,
    UpdateFilter,
    WithId
} from 'mongodb'

export interface IMongoRepository<T extends Document> {
    find(pipeline: Document[], req: Request, res: Response): Promise<void>
    select<ReturnType extends Document = T>(query: Document[], collection?: string, database?: string): Promise<ReturnType[]>
    insertOne(doc: OptionalUnlessRequiredId<T>): Promise<WithId<T>>
    updateOne(filter: Filter<T>, update: T[] | UpdateFilter<T>): Promise<WithId<T>>
    insertMany(objs: OptionalUnlessRequiredId<T>[]): Promise<WithId<T>[]>
    deleteMany(filter: Filter<T>): Promise<WithId<T>[]>
}