import {
    collections,
    OrderDetailENTITY,
    StateStockSerialWarehouse,
    StateWarehouseStock,
    StockSerialDTO,
    WarehouseExitENTITY,
    WarehouseStockENTITY,
    WarehouseStockSerialENTITY
} from 'logiflowerp-sdk';
import { IWarehouseExitMongoRepository } from './IMongoRepository';
import { BadRequestException, ConflictException, NotFoundException } from '@Config/exception';

export class AddSerial {
    protected document!: WarehouseExitENTITY

    constructor(protected readonly repository: IWarehouseExitMongoRepository) { }

    async buildTransactionsAddDetail(keyDetail: string, dto: StockSerialDTO) {
        const transactions: ITransaction<any>[] = []
        const detail = this._validateDetail(keyDetail)
        const warehouseStock = await this._searchWarehouseStock(detail)
        const warehouseStockSerial = await this.searchWarehouseStockSerial(warehouseStock, dto)
        this.createTransactionDocument(keyDetail, dto, transactions)
        this.createTransactionWarehouseStockSerial(warehouseStockSerial, transactions)
        return transactions
    }

    private createTransactionDocument(keyDetail: string, dto: StockSerialDTO, transactions: ITransaction<any>[]) {
        const transaction: ITransaction<WarehouseExitENTITY> = {
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
        transactions.push(transaction)
    }

    private _validateDetail(keyDetail: string) {
        const detail = this.document.detail.find(item => item.keyDetail === keyDetail)
        if (!detail) {
            throw new NotFoundException('Detalle no encontrado o ya eliminado.', true)
        }
        if (detail.serials.length >= detail.amount) {
            throw new ConflictException('Ya se ha alcanzado la cantidad máxima de series permitidas para este detalle.', true)
        }
        return detail
    }

    private async _searchWarehouseStock(detail: OrderDetailENTITY) {
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

    private async searchWarehouseStockSerial(warehouseStock: WarehouseStockENTITY, dto: StockSerialDTO) {
        const pipeline = [{ $match: { keyDetail: warehouseStock.keyDetail, keySearch: warehouseStock.keySearch, serial: dto.serial } }]
        const warehouseStockSerial = await this.repository.selectOne<WarehouseStockSerialENTITY>(pipeline, collections.warehouseStockSerial)
        if (warehouseStockSerial.state !== StateStockSerialWarehouse.DISPONIBLE) {
            throw new BadRequestException(
                `El estado del equipo es ${warehouseStockSerial.state}. No se puede realizar la acción.`,
                true
            )
        }
        return warehouseStockSerial
    }

    private createTransactionWarehouseStockSerial(warehouseStockSerial: WarehouseStockSerialENTITY, transactions: ITransaction<any>[]) {
        const transaction: ITransaction<WarehouseStockSerialENTITY> = {
            collection: collections.warehouseStockSerial,
            transaction: 'updateOne',
            filter: { _id: warehouseStockSerial._id },
            update: {
                $set: {
                    state: StateStockSerialWarehouse.RESERVADO,
                    documentNumber: this.document.documentNumber,
                    updatedate: new Date()
                }
            }
        }
        transactions.push(transaction)
    }
}