import { IWarehouseReturnMongoRepository } from '../Domain';
import {
    collections,
    EmployeeStockENTITY,
    EmployeeStockSerialENTITY,
    OrderDetailENTITY,
    State,
    StateOrder,
    StateStockSerialEmployee,
    StockSerialDTO,
    WarehouseReturnENTITY,
} from 'logiflowerp-sdk';
import { BadRequestException, ConflictException, NotFoundException } from '@Config/exception';
import { WAREHOUSE_RETURN_TYPES } from '../Infrastructure/IoC';
import { inject, injectable } from 'inversify';

@injectable()
export class UseCaseAddSerial {

    private document!: WarehouseReturnENTITY
    private transactions: ITransaction<any>[] = []

    constructor(
        @inject(WAREHOUSE_RETURN_TYPES.RepositoryMongo) private readonly repository: IWarehouseReturnMongoRepository,
    ) { }

    async exec(_id: string, keyDetail: string, dto: StockSerialDTO) {
        await this.searchDocument(_id)
        const detail = this.validateDetail(keyDetail)
        const warehouseStock = await this.searchEmployeeStock(detail)
        const warehouseStockSerial = await this.searchEmployeeStockSerial(warehouseStock, dto)
        this.createTransactionDocument(keyDetail, dto)
        this.createTransactionEmployeeStockSerial(warehouseStockSerial)
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
        if (detail.serials.length >= detail.amount) {
            throw new ConflictException('Ya se ha alcanzado la cantidad máxima de series permitidas para este detalle.', true)
        }
        return detail
    }

    private createTransactionDocument(keyDetail: string, dto: StockSerialDTO) {
        const transaction: ITransaction<WarehouseReturnENTITY> = {
            transaction: 'updateOne',
            filter: {
                _id: this.document._id,
                'detail.keyDetail': keyDetail
            },
            update: {
                $push: {
                    'detail.$.serials': dto
                }
            }
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

    private async searchEmployeeStockSerial(employeeStock: EmployeeStockENTITY, dto: StockSerialDTO) {
        const pipeline = [{
            $match: {
                keyDetail: employeeStock.keyDetail,
                keySearch: employeeStock.keySearch,
                identity: this.document.carrier.identity,
                serial: dto.serial
            }
        }]
        const employeeStockSerial = await this.repository.selectOne<EmployeeStockSerialENTITY>(pipeline, collections.employeeStockSerial)
        if (employeeStockSerial.state !== StateStockSerialEmployee.POSESION) {
            throw new BadRequestException(
                `El estado del equipo es ${employeeStockSerial.state}. No se puede realizar la acción.`,
                true
            )
        }
        return employeeStockSerial
    }

    private createTransactionEmployeeStockSerial(employeeStockSerial: EmployeeStockSerialENTITY) {
        const transaction: ITransaction<EmployeeStockSerialENTITY> = {
            collection: collections.employeeStockSerial,
            transaction: 'updateOne',
            filter: { _id: employeeStockSerial._id },
            update: {
                $set: {
                    state: StateStockSerialEmployee.RESERVADO,
                    documentNumber: this.document.documentNumber,
                    updatedate: new Date()
                }
            }
        }
        this.transactions.push(transaction)
    }

}