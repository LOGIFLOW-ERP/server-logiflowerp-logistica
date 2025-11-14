import { IWarehouseEntryMongoRepository } from '../Domain';
import {
    AuthUserDTO,
    ItemWorkflowOrderDTO,
    OrderDetailENTITY,
    ProducType,
    ProductPriceDTO,
    ProductPriceENTITY,
    StateOrder,
    StateStockSerialWarehouse,
    StateWarehouseStock,
    StockSerialDTO,
    WarehouseEntryENTITY,
    WarehouseStockENTITY,
    WarehouseStockSerialENTITY,
    collections,
    validateCustom
} from 'logiflowerp-sdk';
import {
    BadRequestException,
    ConflictException,
    NotFoundException,
    TooManyRequestsException,
    UnprocessableEntityException
} from '@Config/exception';
import { WAREHOUSE_ENTRY_TYPES } from '../Infrastructure/IoC';
import { inject, injectable } from 'inversify';
import { validateDuplicateSerialEntry } from '@Shared/Infrastructure/Utils';

@injectable()
export class UseCaseValidate {

    private document!: WarehouseEntryENTITY
    private transactions: ITransaction<any>[] = []
    private dataWarehouseStock: WarehouseStockENTITY[] = []
    private newDataWarehouseStock: WarehouseStockENTITY[] = []
    private dataWarehouseStockSerial: WarehouseStockSerialENTITY[] = []
    private newDataWarehouseStockSerial: WarehouseStockSerialENTITY[] = []

    constructor(
        @inject(WAREHOUSE_ENTRY_TYPES.RepositoryMongo) private readonly repository: IWarehouseEntryMongoRepository,
    ) { }

    async exec(_id: string, user: AuthUserDTO) {
        await this.searchDocument(_id)
        const dataProductPrices = await this.searchProductPrice()
        await this.searchWarehouseStocks()
        await this.searchWarehouseStocksSerial()
        await this.updateDocument(dataProductPrices, user)
        this.createTransactionDocument()
        this.createTransactionWarehouseStock()
        this.createTransactionWarehouseStockSerial()
        return this.repository.executeTransactionBatch(this.transactions)
    }

    private async searchDocument(_id: string) {
        const pipeline = [{ $match: { _id } }]
        this.document = await this.repository.selectOne(pipeline)
        if (this.document.state === StateOrder.PROCESANDO) {
            throw new TooManyRequestsException(
                `¡Se está procesando el detalle de este documento!`,
                true
            )
        }
        if (this.document.state !== StateOrder.REGISTRADO) {
            throw new ConflictException(
                `¡El estado de la orden para validar debe ser ${StateOrder.REGISTRADO}!`,
                true
            )
        }
        if (this.document.detail.length === 0) {
            throw new BadRequestException('No se puede validar un ingreso sin detalle', true)
        }
    }

    private searchProductPrice() {
        const pipeline = [{ $match: { itemCode: { $in: this.document.detail.map(e => e.item.itemCode) }, isDeleted: false } }]
        return this.repository.select<ProductPriceENTITY>(pipeline, collections.productPrice)
    }

    private async updateDocument(dataProductPrices: ProductPriceENTITY[], user: AuthUserDTO) {
        for (const [i, detail] of this.document.detail.entries()) {

            if (detail.amount <= 0) {
                throw new UnprocessableEntityException(
                    `La cantidad del detalle debe ser mayor a cero para el código de ítem: ${detail.item.itemCode}`,
                    true
                )
            }

            //#region Price
            if (detail.item.producType === ProducType.SERIE && detail.serials.length !== detail.amount) {
                throw new UnprocessableEntityException(
                    `La cantidad de series registradas no coincide con la cantidad solicitada para el código de ítem: ${detail.item.itemCode}`,
                    true
                )
            }

            const productPrice = dataProductPrices.find(e => e.itemCode === detail.item.itemCode)
            if (!productPrice) {
                throw new NotFoundException(`Precio de producto no encontrado para el código de ítem: ${detail.item.itemCode}`, true)
            }

            detail.price = await validateCustom(productPrice, ProductPriceDTO, UnprocessableEntityException)
            //#endregion Price

            //#region Position
            detail.position = i + 1
            //#endregion Position

            //#region Warehouse Stock
            const warehouseStock = this.dataWarehouseStock.find(
                e => e.keySearch === detail.keySearch && e.keyDetail === detail.keyDetail && e.store.code === this.document.store.code
            )
            if (!warehouseStock) {
                const stock = await this.buildWarehouseStock(detail)
                await this.buildWarehouseStockSerial(detail, stock)
                continue
            }
            this.updateWarehouseStock(warehouseStock, detail)
            await this.updateWarehouseStockSerial(warehouseStock, detail)
            //#endregion Warehouse Stock
        }
        const validation = new ItemWorkflowOrderDTO()
        validation.date = new Date()
        validation.user = user
        this.document.workflow.validation = await validateCustom(validation, ItemWorkflowOrderDTO, UnprocessableEntityException)
    }

    private createTransactionDocument() {
        const transaction: ITransaction<WarehouseEntryENTITY> = {
            transaction: 'updateOne',
            filter: { _id: this.document._id },
            update: {
                $set: {
                    state: StateOrder.VALIDADO,
                    detail: this.document.detail,
                    'workflow.validation': this.document.workflow.validation
                }
            }
        }
        this.transactions.push(transaction)
    }

    //#region Stock almacen
    private async searchWarehouseStocks() {
        const keySearch = this.document.detail[0].keySearch
        const keysDetail = this.document.detail.map(e => e.keyDetail)
        const pipeline = [{ $match: { keySearch, keyDetail: { $in: keysDetail } } }]
        this.dataWarehouseStock = await this.repository.select<WarehouseStockENTITY>(
            pipeline,
            collections.warehouseStock
        )
    }

    private async searchWarehouseStocksSerial() {
        const itemsCode = this.document.detail
            .filter(e => e.item.producType === ProducType.SERIE)
            .map(e => e.item.itemCode)
        if (itemsCode.length === 0) return
        const pipeline = [{ $match: { itemCode: { $in: itemsCode } } }]
        this.dataWarehouseStockSerial = await this.repository.select<WarehouseStockSerialENTITY>(
            pipeline,
            collections.warehouseStockSerial
        )
    }

    private async buildWarehouseStock(detail: OrderDetailENTITY) {
        const newStock = new WarehouseStockENTITY()
        newStock._id = crypto.randomUUID()
        newStock.incomeAmount = detail.amount
        newStock.item = detail.item
        newStock.keyDetail = detail.keyDetail
        newStock.keySearch = detail.keySearch
        newStock.lot = detail.lot
        newStock.stockType = detail.stockType
        newStock.store = this.document.store
        const entity = await validateCustom(newStock, WarehouseStockENTITY, UnprocessableEntityException)
        this.newDataWarehouseStock.push(entity)
        return entity
    }

    private async buildWarehouseStockSerial(detail: OrderDetailENTITY, stock: WarehouseStockENTITY) {
        if (detail.item.producType !== ProducType.SERIE) return
        for (const serial of detail.serials) {
            await this.buildWarehouseStockSerialAux(serial, detail, stock)
        }
    }

    private async buildWarehouseStockSerialAux(serial: StockSerialDTO, detail: OrderDetailENTITY, stock: WarehouseStockENTITY) {
        //#region Validar
        validateDuplicateSerialEntry(
            this.dataWarehouseStockSerial,
            detail.item.itemCode,
            serial.serial
        )
        //#endregion Validar
        const newStock = new WarehouseStockSerialENTITY()
        newStock._id = crypto.randomUUID()
        newStock.brand = serial.brand
        newStock.documentNumber = this.document.documentNumber
        newStock.model = serial.model
        newStock.serial = serial.serial
        newStock.itemCode = detail.item.itemCode
        newStock.updatedate = new Date()
        newStock.keyDetail = stock.keyDetail
        newStock.keySearch = stock.keySearch
        const entity = await validateCustom(newStock, WarehouseStockSerialENTITY, UnprocessableEntityException)
        this.newDataWarehouseStockSerial.push(entity)
    }

    private updateWarehouseStock(warehouseStock: WarehouseStockENTITY, detail: OrderDetailENTITY) {
        if (warehouseStock.state !== StateWarehouseStock.ACTIVO) {
            throw new BadRequestException(
                `El estado del stock almacén ${warehouseStock.keyDetail} es ${warehouseStock.state}. No se puede realizar la acción.`,
                true
            )
        }
        const transaction: ITransaction<WarehouseStockENTITY> = {
            collection: collections.warehouseStock,
            transaction: 'updateOne',
            filter: { _id: warehouseStock._id },
            update: {
                $inc: { incomeAmount: detail.amount }
            }
        }
        this.transactions.push(transaction)
    }

    private async updateWarehouseStockSerial(warehouseStock: WarehouseStockENTITY, detail: OrderDetailENTITY) {
        if (detail.item.producType !== ProducType.SERIE) return
        for (const serial of detail.serials) {
            //#region Validar
            validateDuplicateSerialEntry(
                this.dataWarehouseStockSerial,
                warehouseStock.item.itemCode,
                serial.serial
            )
            //#endregion Validar
            const stockSerial = this.dataWarehouseStockSerial.find(
                e => e.keySearch === warehouseStock.keySearch && e.keyDetail === warehouseStock.keyDetail && e.serial === serial.serial
            )
            if (stockSerial) {
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
                continue
            }
            await this.buildWarehouseStockSerialAux(serial, detail, warehouseStock)
        }
    }

    private createTransactionWarehouseStock() {
        if (!this.newDataWarehouseStock.length) return
        const transaction: ITransaction<WarehouseStockENTITY> = {
            collection: collections.warehouseStock,
            transaction: 'insertMany',
            docs: this.newDataWarehouseStock
        }
        this.transactions.push(transaction)
    }

    private createTransactionWarehouseStockSerial() {
        if (!this.newDataWarehouseStockSerial.length) return
        const transaction: ITransaction<WarehouseStockSerialENTITY> = {
            collection: collections.warehouseStockSerial,
            transaction: 'insertMany',
            docs: this.newDataWarehouseStockSerial
        }
        this.transactions.push(transaction)
    }
    //#endregion

}