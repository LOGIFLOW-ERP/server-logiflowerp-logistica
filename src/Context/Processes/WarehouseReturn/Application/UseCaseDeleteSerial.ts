import { IWarehouseReturnMongoRepository } from '../Domain';
import {
    collections,
    OrderDetailENTITY,
    StateOrder,
    StateStockSerialWarehouse,
    StateWarehouseStock,
    WarehouseReturnENTITY,
    WarehouseStockENTITY,
    WarehouseStockSerialENTITY,
} from 'logiflowerp-sdk';
import { BadRequestException, NotFoundException } from '@Config/exception';
import { WAREHOUSE_RETURN_TYPES } from '../Infrastructure/IoC';
import { inject, injectable } from 'inversify';

@injectable()
export class UseCaseDeleteSerial {

    private transactions: ITransaction<any>[] = []
    private document!: WarehouseReturnENTITY

    constructor(
        @inject(WAREHOUSE_RETURN_TYPES.RepositoryMongo) private readonly repository: IWarehouseReturnMongoRepository,
    ) { }

    // async exec(_id: string, { keyDetail, serial }: { keyDetail: string, serial: string }) {
    //     await this.searchDocument(_id)
    //     const detail = this.validateDetail(keyDetail)
    //     const warehouseStock = await this.searchWarehouseStock(detail)
    //     const warehouseStockSerial = await this.searchWarehouseStockSerial(warehouseStock, serial)
    //     this.createTransactionDocument(keyDetail, serial)
    //     this.createTransactionWarehouseStockSerial(warehouseStockSerial)
    //     await this.repository.executeTransactionBatch(this.transactions)
    //     return this.repository.selectOne([{ $match: { _id: this.document._id } }])
    // }

    // private async searchDocument(_id: string) {
    //     const pipeline = [{ $match: { _id, state: { $ne: StateOrder.VALIDADO } } }]
    //     this.document = await this.repository.selectOne(pipeline)
    // }

    // private createTransactionDocument(keyDetail: string, serial: string) {
    //     const transaction: ITransaction<WarehouseReturnENTITY> = {
    //         transaction: 'updateOne',
    //         filter: {
    //             _id: this.document._id,
    //             'detail.keyDetail': keyDetail
    //         },
    //         update: {
    //             $pull: {
    //                 'detail.$.serials': {
    //                     serial: serial
    //                 }
    //             }
    //         }
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

    // private async searchWarehouseStockSerial(warehouseStock: WarehouseStockENTITY, serial: string) {
    //     const pipeline = [{
    //         $match: {
    //             keySearch: warehouseStock.keySearch,
    //             keyDetail: warehouseStock.keyDetail,
    //             serial
    //         }
    //     }]
    //     const warehouseStockSerial = await this.repository.selectOne<WarehouseStockSerialENTITY>(pipeline, collections.warehouseStockSerial)
    //     if (warehouseStockSerial.state !== StateStockSerialWarehouse.RESERVADO) {
    //         throw new BadRequestException(
    //             `El estado del equipo es ${warehouseStockSerial.state}. No se puede realizar la acción.`,
    //             true
    //         )
    //     }
    //     return warehouseStockSerial
    // }

    // private createTransactionWarehouseStockSerial(warehouseStockSerial: WarehouseStockSerialENTITY) {
    //     const transaction: ITransaction<WarehouseStockSerialENTITY> = {
    //         collection: collections.warehouseStockSerial,
    //         transaction: 'updateOne',
    //         filter: { _id: warehouseStockSerial._id },
    //         update: {
    //             $set: {
    //                 state: StateStockSerialWarehouse.DISPONIBLE,
    //                 documentNumber: this.document.documentNumber,
    //                 updatedate: new Date()
    //             }
    //         }
    //     }
    //     this.transactions.push(transaction)
    // }

}