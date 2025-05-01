import { IWarehouseReturnMongoRepository } from '../Domain';
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
} from 'logiflowerp-sdk';
import { BadRequestException, ConflictException, NotFoundException } from '@Config/exception';
import { WAREHOUSE_RETURN_TYPES } from '../Infrastructure/IoC';
import { inject, injectable } from 'inversify';

@injectable()
export class UseCaseDeleteDetail {

    private document!: WarehouseReturnENTITY
    private transactions: ITransaction<any>[] = []

    constructor(
        @inject(WAREHOUSE_RETURN_TYPES.RepositoryMongo) private readonly repository: IWarehouseReturnMongoRepository,
    ) { }

    async exec(_id: string, keyDetail: string) {
        await this.searchDocument(_id)
        const detail = this.validateDetail(keyDetail)
        const warehouseStock = await this.searchEmployeeStock(detail)
        await this.updateEmployeeStocksSerial(warehouseStock, detail)
        this.createTransactionDocument(keyDetail)
        await this.repository.executeTransactionBatch(this.transactions)
        return this.repository.selectOne([{ $match: { _id: this.document._id } }])
    }

    private async searchDocument(_id: string) {
        const pipeline = [{ $match: { _id, state: { $ne: StateOrder.VALIDADO } } }]
        this.document = await this.repository.selectOne(pipeline)
    }

    private validateDetail(keyDetail: string) {
        const detail = this.document.detail.find(item => item.keyDetail === keyDetail)
        if (!detail) {
            throw new NotFoundException('Detalle no encontrado o ya eliminado.', true)
        }
        return detail
    }

    private createTransactionDocument(keyDetail: string) {
        const transaction: ITransaction<WarehouseReturnENTITY> = {
            transaction: 'updateOne',
            filter: { _id: this.document._id },
            update: { $pull: { detail: { keyDetail } } }
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

    private async updateEmployeeStocksSerial(employeeStock: EmployeeStockENTITY, detail: OrderDetailENTITY) {
        if (detail.item.producType !== ProducType.SERIE) return
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
                `Se encontró (${dataEmployeeStockSerial.length}) series de (${serials.length})`
                , true
            )
        }
        if (dataEmployeeStockSerial.some(e => e.state !== StateStockSerialEmployee.RESERVADO)) {
            throw new ConflictException(
                `Hay serie que no está en estado ${StateStockSerialEmployee.RESERVADO}`,
                true
            )
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