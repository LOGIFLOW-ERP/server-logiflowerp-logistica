import { Request } from 'express'
import { IEmployeeStockMongoRepository } from '../Domain'
import { EMPLOYEE_STOCK_TYPES } from '../Infrastructure/IoC'
import { inject, injectable } from 'inversify'
import { collections, EmployeeStockENTITY, EmployeeStockSerialENTITY, ProductOrderDTO, State, StateStockSerialEmployee, StockType } from 'logiflowerp-sdk';

@injectable()
export class UseCaseGetDataLiquidationOrder {
    constructor(
        @inject(EMPLOYEE_STOCK_TYPES.RepositoryMongo) private readonly repository: IEmployeeStockMongoRepository,
    ) { }

    async exec(req: Request) {
        const pipelineEmployeeStock = [{
            $match: {
                state: State.ACTIVO,
                stockType: StockType.NUEVO,
                'employee.identity': req.user.identity
            }
        }]
        const responseEmployeeStock = await this.repository.select(pipelineEmployeeStock)
        const codes = [...new Set(responseEmployeeStock.map(es => es.item.itemCode))]
        const pipelineEmployeeStockSerials = [{
            $match: {
                itemCode: { $in: codes },
                state: StateStockSerialEmployee.POSESION,
                keySearch: { $regex: 'Nuevo$', $options: 'i' },
                identity: req.user.identity
            }
        }]
        const responseEmployeeStockSerials = await this.repository.select<EmployeeStockSerialENTITY>(pipelineEmployeeStockSerials, collections.employeeStockSerial)
        return this.processMongoDocuments(responseEmployeeStock, responseEmployeeStockSerials)
    }

    private processMongoDocuments(docs: EmployeeStockENTITY[], employeeStockSerials: EmployeeStockSerialENTITY[]) {
        const mapa = new Map<string, { item: ProductOrderDTO, serials: Pick<EmployeeStockSerialENTITY, 'serial' | 'itemCode'>[] }>()
        docs.forEach(doc => {
            const key = doc.item.itemCode
            if (!mapa.has(key)) {
                const serials = employeeStockSerials
                    .filter(ess => ess.itemCode === key)
                    .map(ess => ({ serial: ess.serial, itemCode: ess.itemCode }))
                mapa.set(key, { item: doc.item, serials })
            }
        })
        return Array.from(mapa.values())
    }
}