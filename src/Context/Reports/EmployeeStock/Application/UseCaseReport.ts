import { IEmployeeStockMongoRepository, ReportEmployeeStock } from '../Domain'
import { EMPLOYEE_STOCK_TYPES } from '../Infrastructure/IoC'
import { inject, injectable } from 'inversify'
import { Document } from 'mongodb'

@injectable()
export class UseCaseReport extends ReportEmployeeStock {
    constructor(
        @inject(EMPLOYEE_STOCK_TYPES.RepositoryMongo) private readonly repository: IEmployeeStockMongoRepository,
    ) {
        super()
    }

    async exec(query: Document[]) {
        const response = await this.repository.select([...query, { $match: { isDeleted: false } }])
        const stocks = await this.repository.validateAvailableEmployeeStocks({ _ids: response.map((r: any) => r._id) })
        return this.processMongoDocuments(response, stocks)
    }
}
