import { inject, injectable } from 'inversify'
import { IWarehouseReturnMongoRepository } from '../Domain'
import { WAREHOUSE_RETURN_TYPES } from '../Infrastructure/IoC'
import {
    collections,
    EmployeeStockENTITY,
    EmployeeStockSerialENTITY,
    OrderDetailENTITY,
    ProducType,
    State,
    StateOrder,
    StateStockSerialEmployee,
    WarehouseReturnENTITY,
} from 'logiflowerp-sdk'
import { BadRequestException, ConflictException } from '@Config/exception'

@injectable()
export class UseCaseDeleteOne {

    private document!: WarehouseReturnENTITY
    private transactions: ITransaction<any>[] = []

    constructor(
        @inject(WAREHOUSE_RETURN_TYPES.RepositoryMongo) private readonly repository: IWarehouseReturnMongoRepository,
    ) { }

    async exec(_id: string) {
        const pipeline = [{ $match: { _id, state: { $ne: StateOrder.VALIDADO } } }]
        this.document = await this.repository.selectOne(pipeline)
        await this.updateEmployeeStocksSerial()
        this.createTransactionDocument()
        return this.repository.executeTransactionBatch(this.transactions)
    }

    private createTransactionDocument() {
        const transaction: ITransaction<WarehouseReturnENTITY> = {
            transaction: 'deleteOne',
            filter: { _id: this.document._id },
        }
        this.transactions.push(transaction)
    }

    private async searchEmployeeStock(detail: OrderDetailENTITY) {
        const pipeline = [{
            $match: {
                keySearch: detail.keySearch,
                keyDetail: detail.keyDetail,
                'employee.identity': this.document.carrier.identity,
                'store.code': this.document.store.code
            }
        }]
        const employeeStock = await this.repository.selectOne<EmployeeStockENTITY>(pipeline, collections.employeeStock)
        if (employeeStock.state !== State.ACTIVO) {
            throw new BadRequestException(
                `El estado del stock ${employeeStock.keyDetail} es ${employeeStock.state}. No se puede realizar la acción.`,
                true
            )
        }
        return employeeStock
    }

    private async updateEmployeeStocksSerial() {
        for (const detail of this.document.detail) {
            if (detail.item.producType !== ProducType.SERIE) return
            const employeeStock = await this.searchEmployeeStock(detail)
            const { serials } = detail
            const pipeline = [{
                $match: {
                    keySearch: employeeStock.keySearch,
                    keyDetail: employeeStock.keyDetail,
                    identity: this.document.carrier.identity,
                    serial: { $in: serials.map(e => e.serial) }
                }
            }]
            const dataEmployeeStockSerial = await this.repository.select<EmployeeStockSerialENTITY>(
                pipeline,
                collections.employeeStockSerial
            )
            if (dataEmployeeStockSerial.length !== serials.length) {
                throw new ConflictException(
                    `Se encontró (${dataEmployeeStockSerial.length}) series de (${serials.length}) en posición: ${detail.position}`
                    , true
                )
            }
            if (dataEmployeeStockSerial.some(e => e.state !== StateStockSerialEmployee.RESERVADO)) {
                throw new ConflictException(`Hay serie en posición: ${detail.position} que no está en estado ${StateStockSerialEmployee.RESERVADO}`, true)
            }
            for (const stockSerial of dataEmployeeStockSerial) {
                const transaction: ITransaction<EmployeeStockSerialENTITY> = {
                    collection: collections.employeeStockSerial,
                    transaction: 'updateOne',
                    filter: { _id: stockSerial._id },
                    update: {
                        $set: {
                            state: StateStockSerialEmployee.POSESION,
                            documentNumber: this.document.documentNumber,
                            updatedate: new Date()
                        }
                    }
                }
                this.transactions.push(transaction)
            }
        }
    }

}