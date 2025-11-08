import { Response, Request } from 'express'
import { IEmployeeStockMongoRepository } from '../Domain'
import { EMPLOYEE_STOCK_TYPES } from '../Infrastructure/IoC'
import { inject, injectable } from 'inversify'
import { EmployeeStockENTITY } from 'logiflowerp-sdk';
type PlainObject = { [key: string]: any };

@injectable()
export class UseCaseReport {
    constructor(
        @inject(EMPLOYEE_STOCK_TYPES.RepositoryMongo) private readonly repository: IEmployeeStockMongoRepository,
    ) { }

    async exec(req: Request) {
        const pipeline = req.body
        const response = await this.repository.select(pipeline)
        const stocks = await this.repository.validateAvailableEmployeeStocks({ _ids: response.map((r: any) => r._id) })
        return this.processMongoDocuments(response, stocks)
    }

    processMongoDocuments(docs: EmployeeStockENTITY[], stocks: { keySearch: string; keyDetail: string; identity: string; available: number; }[]): PlainObject[] {
        return docs.map((doc) => this.flattenAndExpandAllArrays(doc, stocks));
    }

    flattenAndExpandAllArrays(doc: EmployeeStockENTITY, stocks: { keySearch: string; keyDetail: string; identity: string; available: number; }[]): PlainObject {
        const results: PlainObject = {}
        const available = stocks.find(s => s.keySearch === doc.keySearch && s.keyDetail === doc.keyDetail && s.identity === doc.employee.identity)
        if (!available) {
            throw new Error(`No available stock found for keySearch: ${doc.keySearch}, keyDetail: ${doc.keyDetail}, identity: ${doc.employee.identity}`);
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
        results['available'] = available.available
        return results;
    }

}
