import { Response, Request } from 'express'
import { IWarehouseStockMongoRepository } from '../Domain'
import { WAREHOUSE_STOCK_TYPES } from '../Infrastructure/IoC'
import { inject, injectable } from 'inversify'
type PlainObject = { [key: string]: any };

@injectable()
export class UseCaseReport {
    constructor(
        @inject(WAREHOUSE_STOCK_TYPES.RepositoryMongo) private readonly repository: IWarehouseStockMongoRepository,
    ) { }

    async exec(req: Request) {
        const pipeline = req.body
        const response = await this.repository.select(pipeline)
        return this.processMongoDocuments(response)
    }

    processMongoDocuments(docs: PlainObject[]): PlainObject[] {
        return docs.map(this.flattenAndExpandAllArrays);
    }

    flattenAndExpandAllArrays(doc: PlainObject): PlainObject {
        const results: PlainObject = {}
        function recurse(obj: any, prefix = '') {
            for (const key in obj) {
                const newKey = prefix ? `${prefix}_${key}` : key
                const value = obj[key]
                if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
                    results[newKey] = value
                } else if (value !== null && typeof value === 'object') {
                    recurse(value, newKey)
                }
            }
        }
        recurse(doc);
        return results;
    }

}
