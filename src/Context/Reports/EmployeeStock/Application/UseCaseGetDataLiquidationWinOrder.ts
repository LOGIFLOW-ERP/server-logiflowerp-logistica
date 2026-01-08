import { IEmployeeStockMongoRepository } from '../Domain'
import { EMPLOYEE_STOCK_TYPES } from '../Infrastructure/IoC'
import { inject, injectable } from 'inversify'
import {
    AuthUserDTO,
    collections,
    EmployeeStockENTITY,
    EmployeeStockSerialENTITY,
    ProductENTITY,
    ProducType,
    ScrapingSystem,
    State,
    StateStockSerialEmployee,
    StockType
} from 'logiflowerp-sdk';

@injectable()
export class UseCaseGetDataLiquidationWinOrder {
    constructor(
        @inject(EMPLOYEE_STOCK_TYPES.RepositoryMongo) private readonly repository: IEmployeeStockMongoRepository,
    ) { }

    async exec(user: AuthUserDTO) {
        const pipelineEmployeeStock = [{
            $match: {
                state: State.ACTIVO,
                isDeleted: false,
                stockType: StockType.NUEVO,
                'employee.identity': user.identity
            }
        }]
        const responseEmployeeStock = await this.repository.select(pipelineEmployeeStock)
        const codes = [...new Set(responseEmployeeStock.map(es => es.item.itemCode))]

        const pipelineProducts = [{
            $match: {
                itemCode: { $in: codes },
                systems: ScrapingSystem.WIN,
                state: State.ACTIVO,
                isDeleted: false
            }
        }]
        const responseProducts = await this.repository.select<ProductENTITY>(pipelineProducts, collections.product)

        const employeeStocks = responseEmployeeStock.filter(es => responseProducts.some(p => p.itemCode === es.item.itemCode))

        const keySearch = [...new Set(employeeStocks.map(es => es.keySearch))]
        const keyDetail = [...new Set(employeeStocks.map(es => es.keyDetail))]

        const pipelineEmployeeStockSerials = [{
            $match: {
                state: StateStockSerialEmployee.POSESION,
                keySearch: { $in: keySearch },
                keyDetail: { $in: keyDetail },
                identity: user.identity
            }
        }]
        const responseEmployeeStockSerials = await this.repository.select<EmployeeStockSerialENTITY>(pipelineEmployeeStockSerials, collections.employeeStockSerial)
        return this.processMongoDocuments(employeeStocks, responseEmployeeStockSerials)
    }

    private processMongoDocuments(docs: EmployeeStockENTITY[], employeeStockSerials: EmployeeStockSerialENTITY[]) {
        const result = docs.map(doc => {
            const ess = doc.item.producType === ProducType.SERIE
                ? employeeStockSerials.filter(
                    ess => ess.itemCode === doc.item.itemCode &&
                        ess.keySearch === doc.keySearch &&
                        ess.keyDetail === doc.keyDetail &&
                        ess.identity === doc.employee.identity
                )
                : []
            return {
                item: doc,
                serials: ess
            }
        })
        return result
    }
}