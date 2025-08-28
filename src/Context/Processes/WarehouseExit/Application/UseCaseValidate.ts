import { inject, injectable } from 'inversify';
import {
    AuthUserDTO,
    collections,
    EmployeeStockENTITY,
    EmployeeStockSerialENTITY,
    ItemWorkflowOrderDTO,
    OrderDetailENTITY,
    ProductPriceDTO,
    ProductPriceENTITY,
    ProducType,
    State,
    StateOrder,
    StateStockSerialEmployee,
    StateStockSerialWarehouse,
    StateWarehouseStock,
    validateCustom,
    WarehouseExitENTITY,
    WarehouseStockENTITY,
    WarehouseStockSerialENTITY
} from 'logiflowerp-sdk';
import { WAREHOUSE_EXIT_TYPES } from '../Infrastructure/IoC';
import { IWarehouseExitMongoRepository } from '../Domain';
import {
    BadRequestException,
    ConflictException,
    NotFoundException,
    UnprocessableEntityException
} from '@Config/exception';
import { validateDuplicateSerialExit } from '@Shared/Infrastructure/Utils';

@injectable()
export class UseCaseValidate {

    private document!: WarehouseExitENTITY
    private transactions: ITransaction<any>[] = []
    private dataWarehouseStock!: WarehouseStockENTITY[]
    private dataWarehouseStockSerial!: WarehouseStockSerialENTITY[]
    private dataEmployeeStock!: EmployeeStockENTITY[]
    private dataEmployeeStockSerial!: EmployeeStockSerialENTITY[]
    private newDataEmployeeStock: EmployeeStockENTITY[] = []
    private newDataEmployeeStockSerial: EmployeeStockSerialENTITY[] = []

    constructor(
        @inject(WAREHOUSE_EXIT_TYPES.RepositoryMongo) private readonly repository: IWarehouseExitMongoRepository,
    ) { }

    async exec(_id: string, user: AuthUserDTO) {
        await this.searchDocument(_id)
        const dataProductPrices = await this.searchProductPrice()
        await this.searchWarehouseStocks()
        await this.searchWarehouseStocksSerial()
        await this.searchEmployeeStocks()
        await this.searchEmployeeStocksSerial()
        await this.updateDocument(dataProductPrices, user)
        this.createTransactionDocument()
        this.createTransactionEmployeeStock()
        this.createTransactionEmployeeStockSerial()
        return this.repository.executeTransactionBatch(this.transactions)
    }

    //#region Document
    private async searchDocument(_id: string) {
        const pipeline = [{ $match: { _id, state: { $ne: StateOrder.VALIDADO } } }]
        this.document = await this.repository.selectOne(pipeline)
        if (this.document.detail.length === 0) {
            throw new BadRequestException('No se puede validar un ingreso sin detalle', true)
        }
    }

    private async updateDocument(dataProductPrices: ProductPriceENTITY[], user: AuthUserDTO) {
        for (const [i, detail] of this.document.detail.entries()) {

            if (detail.amount <= 0) {
                throw new UnprocessableEntityException(
                    `La cantidad del detalle debe ser mayor a cero en la posición: ${detail.position}`,
                    true
                )
            }

            //#region Price
            if (detail.item.producType === ProducType.SERIE && detail.serials.length !== detail.amount) {
                throw new UnprocessableEntityException(
                    `La cantidad de series registradas no coincide con la cantidad solicitada en la posición: ${detail.position}`,
                    true
                )
            }

            const productPrice = dataProductPrices.find(e => e.itemCode === detail.item.itemCode)
            if (!productPrice) {
                throw new NotFoundException(`Precio de producto no encontrado en la posición: ${detail.position}`, true)
            }

            detail.price = await validateCustom(productPrice, ProductPriceDTO, UnprocessableEntityException)
            //#endregion Price

            //#region WarehouseStock
            const warehouseStock = this.dataWarehouseStock.find(
                e => e.keySearch === detail.keySearch && e.keyDetail === detail.keyDetail && e.store.code === this.document.store.code
            )
            if (!warehouseStock) {
                throw new NotFoundException(
                    `No se encontró stock de almacén de item posición ${detail.position}`, true
                )
            }
            this.updateWarehouseStock(warehouseStock, detail)
            this.updateWarehouseStockSerial(warehouseStock, detail)
            //#endregion WarehouseStock

            //#region Employee Stock
            const employeeStock = this.dataEmployeeStock.find(
                e => e.keySearch === detail.keySearch && e.keyDetail === detail.keyDetail && e.employee.identity === this.document.carrier.identity
            )
            if (!employeeStock) {
                const stock = await this.buildEmployeeStock(detail)
                await this.buildEmployeeStockSerial(detail, stock)
                continue
            }
            this.updateEmployeeStock(employeeStock, detail)
            await this.updateEmployeeStockSerial(employeeStock, detail)
            //#endregion Employee Stock

            //#region Position
            detail.position = i + 1
            //#endregion Position
        }
        const validation = new ItemWorkflowOrderDTO()
        validation.date = new Date()
        validation.user = user
        this.document.workflow.validation = await validateCustom(validation, ItemWorkflowOrderDTO, UnprocessableEntityException)
    }
    //#endregion Document

    //#region Product Price
    private searchProductPrice() {
        const pipeline = [{ $match: { itemCode: { $in: this.document.detail.map(e => e.item.itemCode) }, isDeleted: false } }]
        return this.repository.select<ProductPriceENTITY>(pipeline, collections.productPrice)
    }
    //#endregion Product Price

    //#region Search Stocks Warehouse And Employee
    private async searchEmployeeStocks() {
        const keySearch = this.document.detail[0].keySearch
        const keysDetail = this.document.detail.map(e => e.keyDetail)
        const pipeline = [{
            $match: {
                'employee.identity': this.document.carrier.identity,
                keySearch,
                keyDetail: { $in: keysDetail }
            }
        }]
        this.dataEmployeeStock = await this.repository.select<EmployeeStockENTITY>(
            pipeline,
            collections.employeeStock
        )
    }

    private async searchEmployeeStocksSerial() {
        const itemsCode = this.document.detail
            .filter(e => e.item.producType === ProducType.SERIE)
            .map(e => e.item.itemCode)
        if (itemsCode.length === 0) return
        const pipeline = [{ $match: { itemCode: { $in: itemsCode } } }]
        this.dataEmployeeStockSerial = await this.repository.select<EmployeeStockSerialENTITY>(
            pipeline,
            collections.employeeStockSerial
        )
    }

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
        const keySearch = this.document.detail[0].keySearch
        const keysDetail = this.document.detail.map(e => e.keyDetail)
        if (keysDetail.length === 0) return
        const pipeline = [{ $match: { keySearch, keyDetail: { $in: keysDetail } } }]
        this.dataWarehouseStockSerial = await this.repository.select<WarehouseStockSerialENTITY>(
            pipeline,
            collections.warehouseStockSerial
        )
    }
    //#endregion Search Stocks Warehouse And Employee

    //#region EmployeeStock
    private async buildEmployeeStock(detail: OrderDetailENTITY) {
        const newStock = new EmployeeStockENTITY()
        newStock._id = crypto.randomUUID()
        newStock.incomeAmount = detail.amount
        newStock.item = detail.item
        newStock.keyDetail = detail.keyDetail
        newStock.keySearch = detail.keySearch
        newStock.lot = detail.lot
        newStock.stockType = detail.stockType
        newStock.store = this.document.store
        newStock.employee = this.document.carrier
        const entity = await validateCustom(newStock, EmployeeStockENTITY, UnprocessableEntityException)
        this.newDataEmployeeStock.push(entity)
        return entity
    }

    private async buildEmployeeStockSerial(detail: OrderDetailENTITY, stock: EmployeeStockENTITY) {
        if (detail.item.producType !== ProducType.SERIE) return
        for (const serial of detail.serials) {
            //#region Validar
            validateDuplicateSerialExit(
                this.dataEmployeeStockSerial,
                detail.item.itemCode,
                serial.serial
            )
            const newStock = new EmployeeStockSerialENTITY()
            newStock._id = crypto.randomUUID()
            newStock.brand = serial.brand
            newStock.documentNumber = this.document.documentNumber
            newStock.model = serial.model
            newStock.serial = serial.serial
            newStock.itemCode = stock.item.itemCode
            newStock.updatedate = new Date()
            newStock.keyDetail = stock.keyDetail
            newStock.keySearch = stock.keySearch
            newStock.identity = this.document.carrier.identity
            const entity = await validateCustom(newStock, EmployeeStockSerialENTITY, UnprocessableEntityException)
            this.newDataEmployeeStockSerial.push(entity)
        }
    }

    private updateEmployeeStock(employeeStock: EmployeeStockENTITY, detail: OrderDetailENTITY) {
        if (employeeStock.state !== State.ACTIVO) {
            throw new BadRequestException(
                `El estado del stock personal ${employeeStock.keyDetail} es ${employeeStock.state}. No se puede realizar la acción.`,
                true
            )
        }
        const transaction: ITransaction<EmployeeStockENTITY> = {
            collection: collections.employeeStock,
            transaction: 'updateOne',
            filter: { _id: employeeStock._id },
            update: {
                $inc: { incomeAmount: detail.amount }
            }
        }
        this.transactions.push(transaction)
    }

    private async updateEmployeeStockSerial(employeeStock: EmployeeStockENTITY, detail: OrderDetailENTITY) {
        if (detail.item.producType !== ProducType.SERIE) return
        for (const serial of detail.serials) {
            //#region Validar
            validateDuplicateSerialExit(
                this.dataEmployeeStockSerial,
                employeeStock.item.itemCode,
                serial.serial
            )
            //#endregion Validar
            const stockSerial = this.dataEmployeeStockSerial.find(
                e => e.keySearch === employeeStock.keySearch && e.keyDetail === employeeStock.keyDetail && e.serial === serial.serial && e.identity === this.document.carrier.identity
            )
            if (stockSerial) {
                const states = [StateStockSerialEmployee.POSESION]
                if (states.includes(stockSerial.state)) {
                    throw new ConflictException(
                        `La serie ${serial.serial} en ${detail.keyDetail} está en estado ${stockSerial.state} del personal y no se le puede entregar nuevamente.`
                        , true
                    )
                }
                const transaction: ITransaction<EmployeeStockSerialENTITY> = {
                    collection: collections.employeeStockSerial,
                    transaction: 'updateOne',
                    filter: { _id: stockSerial._id },
                    update: {
                        $set: { state: StateStockSerialEmployee.POSESION }
                    }
                }
                this.transactions.push(transaction)
                continue
            }
            await this.buildEmployeeStockSerial(detail, employeeStock)
        }
    }
    //#endregion EmployeeStock

    //#region WarehouseStock
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
                $inc: { ouputQuantity: detail.amount }
            }
        }
        this.transactions.push(transaction)
    }

    private updateWarehouseStockSerial(warehouseStock: WarehouseStockENTITY, detail: OrderDetailENTITY) {
        if (detail.item.producType !== ProducType.SERIE) return
        for (const serial of detail.serials) {
            const stockSerial = this.dataWarehouseStockSerial.find(
                e => e.keyDetail === warehouseStock.keyDetail && e.keySearch === warehouseStock.keySearch && e.serial === serial.serial
            )
            if (!stockSerial) {
                throw new NotFoundException(
                    `No se pudo encontrar la serie ${serial.serial} en la posición ${detail.position}.`,
                    true
                )
            }
            if (stockSerial.state !== StateStockSerialWarehouse.RESERVADO) {
                throw new ConflictException(
                    `La serie ${serial.serial} en la posición ${detail.position} no está ${StateStockSerialWarehouse.RESERVADO}.`,
                    true
                )
            }
            const transaction: ITransaction<WarehouseStockSerialENTITY> = {
                collection: collections.warehouseStockSerial,
                transaction: 'updateOne',
                filter: { _id: stockSerial._id },
                update: {
                    $set: {
                        state: StateStockSerialWarehouse.ATENDIDO,
                        documentNumber: this.document.documentNumber,
                        updatedate: new Date()
                    }
                }
            }
            this.transactions.push(transaction)
        }
    }
    //#endregion WarehouseStock

    //#region Transactions
    private createTransactionDocument() {
        const transaction: ITransaction<WarehouseExitENTITY> = {
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

    private createTransactionEmployeeStock() {
        if (!this.newDataEmployeeStock.length) return
        const transaction: ITransaction<EmployeeStockENTITY> = {
            collection: collections.employeeStock,
            transaction: 'insertMany',
            docs: this.newDataEmployeeStock
        }
        this.transactions.push(transaction)
    }

    private createTransactionEmployeeStockSerial() {
        if (!this.newDataEmployeeStockSerial.length) return
        const transaction: ITransaction<EmployeeStockSerialENTITY> = {
            collection: collections.employeeStockSerial,
            transaction: 'insertMany',
            docs: this.newDataEmployeeStockSerial
        }
        this.transactions.push(transaction)
    }
    //#endregion Transactions

}