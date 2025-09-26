import { Response, Request } from 'express'
import { IWarehouseStockMongoRepository } from '../Domain'
import { WAREHOUSE_STOCK_TYPES } from '../Infrastructure/IoC'
import { inject, injectable } from 'inversify'
import { WarehouseStockENTITY } from 'logiflowerp-sdk';
type PlainObject = { [key: string]: any };

@injectable()
export class UseCaseReport {
    constructor(
        @inject(WAREHOUSE_STOCK_TYPES.RepositoryMongo) private readonly repository: IWarehouseStockMongoRepository,
    ) { }

    async exec(req: Request) {
        const pipeline = req.body
        const response = await this.repository.select(pipeline)
        const stocks = await this.repository.validateAvailableWarehouseStocks({ _ids: response.map(r => r._id) })
        return this.processMongoDocuments(response, stocks)
    }

    processMongoDocuments(docs: WarehouseStockENTITY[], stocks: {
        keySearch: string;
        keyDetail: string;
        available: number;
    }[]): PlainObject[] {
        return docs.map((doc) => this.flattenAndExpandAllArrays(doc, stocks));
    }

    flattenAndExpandAllArrays(doc: WarehouseStockENTITY, stocks: { keySearch: string; keyDetail: string; available: number; }[]): PlainObject {
        const results: PlainObject = {}
        const available = stocks.find(s => s.keySearch === doc.keySearch && s.keyDetail === doc.keyDetail)
        if (!available) {
            throw new Error(`No available stock found for keySearch: ${doc.keySearch}, keyDetail: ${doc.keyDetail}`);
        }
        results['stock'] = available.available
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
