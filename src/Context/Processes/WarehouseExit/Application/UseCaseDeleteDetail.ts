import { IWarehouseExitMongoRepository } from '../Domain';
import {
    collections,
    OrderDetailENTITY,
    ProducType,
    StateOrder,
    StateStockSerialWarehouse,
    WarehouseExitENTITY,
    WarehouseStockSerialENTITY,
} from 'logiflowerp-sdk';
import { ConflictException, NotFoundException } from '@Config/exception';
import { WAREHOUSE_EXIT_TYPES } from '../Infrastructure/IoC';
import { inject, injectable } from 'inversify';

@injectable()
export class UseCaseDeleteDetail {

    private document!: WarehouseExitENTITY
    private transactions: ITransaction<any>[] = []

    constructor(
        @inject(WAREHOUSE_EXIT_TYPES.RepositoryMongo) private readonly repository: IWarehouseExitMongoRepository,
    ) { }

    async exec(_id: string, keyDetail: string) {
        await this.searchDocument(_id)
        const detail = this.validateDetail(keyDetail)
        await this.updateWarehouseStocksSerial(detail)
        this.createTransactionDocument(keyDetail)
        await this.repository.executeTransactionBatch(this.transactions)
        return this.repository.selectOne([{ $match: { _id: this.document._id } }])
    }

    private async searchDocument(_id: string) {
        const pipeline = [{ $match: { _id, state: { $ne: StateOrder.VALIDADO } } }]
        this.document = await this.repository.selectOne(pipeline)
    }

    private createTransactionDocument(keyDetail: string) {
        const transaction: ITransaction<WarehouseExitENTITY> = {
            transaction: 'updateOne',
            filter: { _id: this.document._id },
            update: { $pull: { detail: { keyDetail } } }
        }
        this.transactions.push(transaction)
    }

    private validateDetail(keyDetail: string) {
        const detail = this.document.detail.find(item => item.keyDetail === keyDetail)
        if (!detail) {
            throw new NotFoundException('Detalle no encontrado o ya eliminado.', true)
        }
        return detail
    }

    private async updateWarehouseStocksSerial(detail: OrderDetailENTITY) {
        if (detail.item.producType !== ProducType.SERIE) return
        const { keyDetail, keySearch, serials } = detail
        const pipeline = [{ $match: { keySearch, keyDetail, serial: { $in: serials.map(e => e.serial) } } }]
        const dataWarehouseStockSerial = await this.repository.select<WarehouseStockSerialENTITY>(
            pipeline,
            collections.warehouseStockSerial
        )
        if (dataWarehouseStockSerial.length !== detail.serials.length) {
            throw new ConflictException(
                `Se encontró (${dataWarehouseStockSerial.length}) series de (${detail.serials.length})`
                , true
            )
        }
        if (dataWarehouseStockSerial.some(e => e.state !== StateStockSerialWarehouse.RESERVADO)) {
            throw new ConflictException(
                `Hay serie que no está en estado ${StateStockSerialWarehouse.RESERVADO}`,
                true
            )
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