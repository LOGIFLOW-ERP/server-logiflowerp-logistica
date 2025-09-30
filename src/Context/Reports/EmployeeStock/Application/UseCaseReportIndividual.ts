import { Request } from 'express'
import { IEmployeeStockMongoRepository } from '../Domain'
import { EMPLOYEE_STOCK_TYPES } from '../Infrastructure/IoC'
import { inject, injectable } from 'inversify'
import { EmployeeStockENTITY, State, StockType } from 'logiflowerp-sdk';

@injectable()
export class UseCaseReportIndividual {
    constructor(
        @inject(EMPLOYEE_STOCK_TYPES.RepositoryMongo) private readonly repository: IEmployeeStockMongoRepository,
    ) { }

    async exec(req: Request) {
        const pipeline = [{
            $match: {
                state: State.ACTIVO,
                stockType: StockType.NUEVO,
                'employee.identity': req.user.identity
            }
        }]
        const response = await this.repository.select(pipeline)
        const stocks = await this.repository.validateAvailableEmployeeStocks({ _ids: response.map((r) => r._id) })
        this.processMongoDocuments(response, stocks)
        return response
    }

    private processMongoDocuments(docs: EmployeeStockENTITY[], stocks: { keySearch: string; keyDetail: string; identity: string; available: number; }[]) {
        docs.forEach((doc) => {
            const available = stocks.find(s => s.keySearch === doc.keySearch && s.keyDetail === doc.keyDetail && s.identity === doc.employee.identity)
            if (!available) {
                throw new Error(`No available stock found for keySearch: ${doc.keySearch}, keyDetail: ${doc.keyDetail}, identity: ${doc.employee.identity}`);
            }
            doc.available = available.available
            return doc
        })
    }
}
