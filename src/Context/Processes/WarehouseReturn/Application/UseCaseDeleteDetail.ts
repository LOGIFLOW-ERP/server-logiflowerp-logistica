import { IWarehouseReturnMongoRepository } from '../Domain';
import {
    collections,
    OrderDetailENTITY,
    ProducType,
    StateOrder,
    StateStockSerialWarehouse,
    StateWarehouseStock,
    WarehouseReturnENTITY,
    WarehouseStockENTITY,
    WarehouseStockSerialENTITY,
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

    // async exec(_id: string, keyDetail: string) {
    //     await this.searchDocument(_id)
    //     const detail = this.validateDetail(keyDetail)
    //     const warehouseStock = await this.searchWarehouseStock(detail)
    //     await this.updateWarehouseStocksSerial(warehouseStock, detail)
    //     this.createTransactionDocument(keyDetail)
    //     await this.repository.executeTransactionBatch(this.transactions)
    //     return this.repository.selectOne([{ $match: { _id: this.document._id } }])
    // }

    // private async searchDocument(_id: string) {
    //     const pipeline = [{ $match: { _id, state: { $ne: StateOrder.VALIDADO } } }]
    //     this.document = await this.repository.selectOne(pipeline)
    // }

    // private createTransactionDocument(keyDetail: string) {
    //     const transaction: ITransaction<WarehouseReturnENTITY> = {
    //         transaction: 'updateOne',
    //         filter: { _id: this.document._id },
    //         update: { $pull: { detail: { keyDetail } } }
    //     }
    //     this.transactions.push(transaction)
    // }

    // private validateDetail(keyDetail: string) {
    //     const detail = this.document.detail.find(item => item.keyDetail === keyDetail)
    //     if (!detail) {
    //         throw new NotFoundException('Detalle no encontrado o ya eliminado.', true)
    //     }
    //     return detail
    // }

    // private async searchWarehouseStock(detail: OrderDetailENTITY) {
    //     const pipeline = [{ $match: { keySearch: detail.keySearch, keyDetail: detail.keyDetail, 'store.code': this.document.store.code } }]
    //     const warehouseStock = await this.repository.selectOne<WarehouseStockENTITY>(pipeline, collections.warehouseStock)
    //     if (warehouseStock.state !== StateWarehouseStock.ACTIVO) {
    //         throw new BadRequestException(
    //             `El estado del stock almacén ${warehouseStock.keyDetail} es ${warehouseStock.state}. No se puede realizar la acción.`,
    //             true
    //         )
    //     }
    //     return warehouseStock
    // }

    // private async updateWarehouseStocksSerial(warehouseStock: WarehouseStockENTITY, detail: OrderDetailENTITY) {
    //     if (detail.item.producType !== ProducType.SERIE) return
    //     const { serials } = detail
    //     const pipeline = [{
    //         $match: {
    //             keySearch: warehouseStock.keySearch,
    //             keyDetail: warehouseStock.keyDetail,
    //             serial: { $in: serials.map(e => e.serial) }
    //         }
    //     }]
    //     const dataWarehouseStockSerial = await this.repository.select<WarehouseStockSerialENTITY>(
    //         pipeline,
    //         collections.warehouseStockSerial
    //     )
    //     if (dataWarehouseStockSerial.length !== serials.length) {
    //         throw new ConflictException(
    //             `Se encontró (${dataWarehouseStockSerial.length}) series de (${serials.length})`
    //             , true
    //         )
    //     }
    //     if (dataWarehouseStockSerial.some(e => e.state !== StateStockSerialWarehouse.RESERVADO)) {
    //         throw new ConflictException(
    //             `Hay serie que no está en estado ${StateStockSerialWarehouse.RESERVADO}`,
    //             true
    //         )
    //     }
    //     for (const stockSerial of dataWarehouseStockSerial) {
    //         const transaction: ITransaction<WarehouseStockSerialENTITY> = {
    //             collection: collections.warehouseStockSerial,
    //             transaction: 'updateOne',
    //             filter: { _id: stockSerial._id },
    //             update: {
    //                 $set: {
    //                     state: StateStockSerialWarehouse.DISPONIBLE,
    //                     documentNumber: this.document.documentNumber,
    //                     updatedate: new Date()
    //                 }
    //             }
    //         }
    //         this.transactions.push(transaction)
    //     }
    // }

}