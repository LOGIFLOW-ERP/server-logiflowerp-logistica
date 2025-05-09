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

    async exec(req: Request, res: Response) {
        const pipeline = req.body
        const response = await this.repository.select(pipeline)
        return this.processMongoDocuments(response)
    }

    processMongoDocuments(docs: PlainObject[]): PlainObject[] {
        return docs.flatMap(this.flattenAndExpandAllArrays);
    }

    flattenAndExpandAllArrays(doc: PlainObject): PlainObject[] {
        const results: PlainObject[] = [];

        function recurse(obj: any, prefix = '', base: PlainObject = {}) {
            const hasArray = Object.values(obj).some(v => Array.isArray(v));
            const localBase: PlainObject = { ...base };

            for (const key in obj) {
                const value = obj[key];
                const newKey = prefix ? `${prefix}_${key}` : key;

                if (Array.isArray(value)) {
                    value.forEach(item => {
                        recurse(item, newKey, { ...localBase });
                    });
                    return; // arrays generan nuevas ramas, no continuar aquí
                } else if (value !== null && typeof value === 'object') {
                    recurse(value, newKey, localBase);
                } else {
                    localBase[newKey] = value;
                }
            }

            if (!hasArray) {
                results.push(localBase);
            }
        }

        recurse(doc);
        return results;
    }

}
