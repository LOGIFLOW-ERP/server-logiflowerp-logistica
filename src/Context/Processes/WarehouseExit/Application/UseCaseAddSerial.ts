import { AddSerial, IWarehouseExitMongoRepository } from '../Domain';
import {
    collections,
    OrderDetailENTITY,
    StateOrder,
    StateStockSerialWarehouse,
    StateWarehouseStock,
    StockSerialDTO,
    WarehouseExitENTITY,
    WarehouseStockENTITY,
    WarehouseStockSerialENTITY,
} from 'logiflowerp-sdk';
import { BadRequestException, ConflictException, NotFoundException } from '@Config/exception';
import { WAREHOUSE_EXIT_TYPES } from '../Infrastructure/IoC';
import { inject, injectable } from 'inversify';

@injectable()
export class UseCaseAddSerial extends AddSerial {

    // private document!: WarehouseExitENTITY
    private transactions: ITransaction<any>[] = []

    constructor(
        @inject(WAREHOUSE_EXIT_TYPES.RepositoryMongo) protected readonly repository: IWarehouseExitMongoRepository,
    ) {
        super(repository)
    }

    async exec(_id: string, keyDetail: string, dto: StockSerialDTO) {
        await this.searchDocument(_id)
        // const detail = this.validateDetail(keyDetail)
        // const warehouseStock = await this.searchWarehouseStock(detail)
        // const warehouseStockSerial = await this.searchWarehouseStockSerial(warehouseStock, dto)
        // this.createTransactionDocument(keyDetail, dto)
        // this.createTransactionWarehouseStockSerial(warehouseStockSerial)
        await this.buildTransactionsAddDetail(keyDetail, dto, this.transactions)
        await this.repository.executeTransactionBatch(this.transactions)
        return this.repository.selectOne([{ $match: { _id: this.document._id } }])
    }

    private async searchDocument(_id: string) {
        const pipeline = [{ $match: { _id, state: { $ne: StateOrder.VALIDADO } } }]
        this.document = await this.repository.selectOne(pipeline)
    }

    // private createTransactionDocument(keyDetail: string, dto: StockSerialDTO) {
    //     const transaction: ITransaction<WarehouseExitENTITY> = {
    //         transaction: 'updateOne',
    //         filter: {
    //             _id: this.document._id,
    //             'detail.keyDetail': keyDetail
    //         },
    //         update: {
    //             $push: {
    //                 'detail.$.serials': dto
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
    //     if (detail.serials.length >= detail.amount) {
    //         throw new ConflictException('Ya se ha alcanzado la cantidad máxima de series permitidas para este detalle.', true)
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

    // private async searchWarehouseStockSerial(warehouseStock: WarehouseStockENTITY, dto: StockSerialDTO) {
    //     const pipeline = [{ $match: { keyDetail: warehouseStock.keyDetail, keySearch: warehouseStock.keySearch, serial: dto.serial } }]
    //     const warehouseStockSerial = await this.repository.selectOne<WarehouseStockSerialENTITY>(pipeline, collections.warehouseStockSerial)
    //     if (warehouseStockSerial.state !== StateStockSerialWarehouse.DISPONIBLE) {
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
    //                 state: StateStockSerialWarehouse.RESERVADO,
    //                 documentNumber: this.document.documentNumber,
    //                 updatedate: new Date()
    //             }
    //         }
    //     }
    //     this.transactions.push(transaction)
    // }
}