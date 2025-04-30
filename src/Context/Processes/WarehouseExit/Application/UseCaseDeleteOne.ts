import { inject, injectable } from 'inversify'
import { IWarehouseExitMongoRepository } from '../Domain'
import { WAREHOUSE_EXIT_TYPES } from '../Infrastructure/IoC'
import {
    collections,
    OrderDetailENTITY,
    ProducType,
    StateOrder,
    StateStockSerialWarehouse,
    StateWarehouseStock,
    WarehouseExitENTITY,
    WarehouseStockENTITY,
    WarehouseStockSerialENTITY
} from 'logiflowerp-sdk'
import { BadRequestException, ConflictException } from '@Config/exception'

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

    private async searchWarehouseStock(detail: OrderDetailENTITY) {
        const pipeline = [{ $match: { keySearch: detail.keySearch, keyDetail: detail.keyDetail, 'store.code': this.document.store.code } }]
        const warehouseStock = await this.repository.selectOne<WarehouseStockENTITY>(pipeline, collections.warehouseStock)
        if (warehouseStock.state !== StateWarehouseStock.ACTIVO) {
            throw new BadRequestException(
                `El estado del stock almacén ${warehouseStock.keyDetail} es ${warehouseStock.state}. No se puede realizar la acción.`,
                true
            )
        }
        return warehouseStock
    }

    private async updateWarehouseStocksSerial() {
        for (const detail of this.document.detail) {
            if (detail.item.producType !== ProducType.SERIE) return
            const warehouseStock = await this.searchWarehouseStock(detail)
            const { serials } = detail
            const pipeline = [{
                $match: {
                    keySearch: warehouseStock.keySearch,
                    keyDetail: warehouseStock.keyDetail,
                    serial: { $in: serials.map(e => e.serial) }
                }
            }]
            const dataWarehouseStockSerial = await this.repository.select<WarehouseStockSerialENTITY>(
                pipeline,
                collections.warehouseStockSerial
            )
            if (dataWarehouseStockSerial.length !== serials.length) {
                throw new ConflictException(
                    `Se encontró (${dataWarehouseStockSerial.length}) series de (${serials.length}) en posición: ${detail.position}`
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
                        $set: {
                            state: StateStockSerialWarehouse.DISPONIBLE,
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