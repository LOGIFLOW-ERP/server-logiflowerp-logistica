import { inject, injectable } from 'inversify'
import { IWarehouseExitMongoRepository } from '../Domain'
import { WAREHOUSE_EXIT_TYPES } from '../Infrastructure/IoC'
import {
    collections,
    ProducType,
    StateOrder,
    StateStockSerialWarehouse,
    WarehouseExitENTITY,
    WarehouseStockSerialENTITY
} from 'logiflowerp-sdk'
import { ConflictException } from '@Config/exception'

@injectable()
export class UseCaseDeleteOne {

    private document!: WarehouseExitENTITY
    private transactions: ITransaction<any>[] = []

    constructor(
        @inject(WAREHOUSE_EXIT_TYPES.RepositoryMongo) private readonly repository: IWarehouseExitMongoRepository,
    ) { }

    async exec(_id: string) {
        const pipeline = [{ $match: { _id, state: { $ne: StateOrder.VALIDADO } } }]
        this.document = await this.repository.selectOne(pipeline)
        await this.updateWarehouseStocksSerial()
        this.createTransactionDocument()
        return this.repository.executeTransactionBatch(this.transactions)
    }

    private createTransactionDocument() {
        const transaction: ITransaction<WarehouseExitENTITY> = {
            transaction: 'deleteOne',
            filter: { _id: this.document._id },
        }
        this.transactions.push(transaction)
    }

    private async updateWarehouseStocksSerial() {
        for (const detail of this.document.detail) {
            if (detail.item.producType !== ProducType.SERIE) return
            const { keyDetail, keySearch, serials } = detail
            const pipeline = [{ $match: { keySearch, keyDetail, serial: { $in: serials.map(e => e.serial) } } }]
            const dataWarehouseStockSerial = await this.repository.select<WarehouseStockSerialENTITY>(
                pipeline,
                collections.warehouseStockSerial
            )
            if (dataWarehouseStockSerial.length !== detail.serials.length) {
                throw new ConflictException(
                    `Se encontró (${dataWarehouseStockSerial.length}) series de (${detail.serials.length}) en posición: ${detail.position}`
                    , true
                )
            }
            if (dataWarehouseStockSerial.some(e => e.state !== StateStockSerialWarehouse.RESERVADO)) {
                throw new ConflictException(`Hay serie en posición: ${detail.position} que no está en estado ${StateStockSerialWarehouse.RESERVADO}`, true)
            }
            for (const stockSerial of dataWarehouseStockSerial) {
                const transaction: ITransaction<WarehouseStockSerialENTITY> = {
                    collection: collections.warehouseStockSerial,
                    transaction: 'updateOne',
                    filter: { _id: stockSerial._id },
                    update: {
                        $set: { state: StateStockSerialWarehouse.DISPONIBLE }
                    }
                }
                this.transactions.push(transaction)
            }
        }
    }

}