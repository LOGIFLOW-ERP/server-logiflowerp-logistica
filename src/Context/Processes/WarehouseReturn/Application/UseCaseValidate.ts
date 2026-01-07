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
    WarehouseReturnENTITY,
    WarehouseStockENTITY,
    WarehouseStockSerialENTITY
} from 'logiflowerp-sdk';
import { WAREHOUSE_RETURN_TYPES } from '../Infrastructure/IoC';
import { IWarehouseReturnMongoRepository } from '../Domain';
import {
    BadRequestException,
    ConflictException,
    NotFoundException,
    UnprocessableEntityException
} from '@Config/exception';
import { validateDuplicateSerialReturn } from '@Shared/Infrastructure/Utils';

@injectable()
export class UseCaseValidate {

    private document!: WarehouseReturnENTITY
    private transactions: ITransaction<any>[] = []
    private dataWarehouseStock!: WarehouseStockENTITY[]
    private dataWarehouseStockSerial!: WarehouseStockSerialENTITY[]
    private dataEmployeeStock!: EmployeeStockENTITY[]
    private dataEmployeeStockSerial!: EmployeeStockSerialENTITY[]

    constructor(
        @inject(WAREHOUSE_RETURN_TYPES.RepositoryMongo) private readonly repository: IWarehouseReturnMongoRepository,
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
        return this.repository.executeTransactionBatch(this.transactions)
    }

    // //#region Document
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

            if (detail.item.producType === ProducType.SERIE && detail.serials.length !== detail.amount) {
                throw new UnprocessableEntityException(
                    `La cantidad de series registradas no coincide con la cantidad solicitada en la posición: ${detail.position}`,
                    true
                )
            }

            //#region Price
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
                throw new NotFoundException(
                    `No se encontró stock de personal de item posición ${detail.position}`, true
                )
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
                'store.code': this.document.store.code,
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
        const keySearch = this.document.detail[0].keySearch
        const keysDetail = this.document.detail.map(e => e.keyDetail)
        if (keysDetail.length === 0) return
        const pipeline = [{
            $match: {
                keySearch,
                keyDetail: { $in: keysDetail },
                identity: this.document.carrier.identity,
            }
        }]
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
    //#endregion Search Stocks Warehouse And Employee

    //#region EmployeeStock
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
                $inc: { amountReturned: detail.amount }
            }
        }
        this.transactions.push(transaction)
    }

    private async updateEmployeeStockSerial(employeeStock: EmployeeStockENTITY, detail: OrderDetailENTITY) {
        if (detail.item.producType !== ProducType.SERIE) return
        for (const serial of detail.serials) {
            const stockSerial = this.dataEmployeeStockSerial.find(
                e => e.keySearch === employeeStock.keySearch && e.keyDetail === employeeStock.keyDetail && e.serial === serial.serial && e.identity === this.document.carrier.identity
            )
            if (!stockSerial) {
                throw new NotFoundException(
                    `No se encontró stock personal serie de item posición ${detail.position}`, true
                )
            }
            if (StateStockSerialEmployee.RESERVADO !== stockSerial.state) {
                throw new ConflictException(
                    `La serie ${serial.serial} en ${detail.keyDetail} está en estado ${stockSerial.state} del personal y no se le puede devolver.`
                    , true
                )
            }
            const transaction: ITransaction<EmployeeStockSerialENTITY> = {
                collection: collections.employeeStockSerial,
                transaction: 'updateOne',
                filter: { _id: stockSerial._id },
                update: {
                    $set: { state: StateStockSerialEmployee.DEVUELTO }
                }
            }
            this.transactions.push(transaction)
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
                $inc: { amountReturned: detail.amount }
            }
        }
        this.transactions.push(transaction)
    }

    private updateWarehouseStockSerial(warehouseStock: WarehouseStockENTITY, detail: OrderDetailENTITY) {
        if (detail.item.producType !== ProducType.SERIE) return
        for (const serial of detail.serials) {
            //#region Validar
            validateDuplicateSerialReturn(
                this.dataWarehouseStockSerial,
                warehouseStock.item.itemCode,
                serial.serial
            )
            //#endregion Validar
            const stockSerial = this.dataWarehouseStockSerial.find(
                e => e.keyDetail === warehouseStock.keyDetail && e.keySearch === warehouseStock.keySearch && e.serial === serial.serial
            )
            if (!stockSerial) {
                throw new NotFoundException(
                    `No se pudo encontrar la serie ${serial.serial} en la posición ${detail.position}.`,
                    true
                )
            }
            if (stockSerial.state !== StateStockSerialWarehouse.ATENDIDO) {
                throw new ConflictException(
                    `La serie ${serial.serial} en la posición ${detail.position} no está ${StateStockSerialWarehouse.ATENDIDO}.`,
                    true
                )
            }
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
    //#endregion WarehouseStock

    //#region Transactions
    private createTransactionDocument() {
        const transaction: ITransaction<WarehouseReturnENTITY> = {
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
    //#endregion Transactions

}