import { IEmployeeStockMongoRepository, ReportEmployeeStock } from '../Domain'
import { EMPLOYEE_STOCK_TYPES } from '../Infrastructure/IoC'
import { inject, injectable } from 'inversify'
import { Document } from 'mongodb'
import { AuthUserDTO } from 'logiflowerp-sdk'

@injectable()
export class UseCaseReportIndividual extends ReportEmployeeStock {
    constructor(
        @inject(EMPLOYEE_STOCK_TYPES.RepositoryMongo) private readonly repository: IEmployeeStockMongoRepository,
    ) {
        super()
    }

    async exec(query: Document[], user: AuthUserDTO) {

        const response = await this.repository.select(
            [
                ...query,
                {
                    $match: {
                        'employee.identity': user.identity,
                        isDeleted: false
                    }
                }
            ]
        )
        const stocks = await this.repository.validateAvailableEmployeeStocks({ _ids: response.map((r) => r._id) })
        return this.processMongoDocuments(response, stocks)
    }
}
