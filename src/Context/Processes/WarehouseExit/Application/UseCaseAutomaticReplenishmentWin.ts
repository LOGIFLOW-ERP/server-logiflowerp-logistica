import { inject, injectable } from 'inversify';
import { WAREHOUSE_EXIT_TYPES } from '../Infrastructure/IoC';
import { AddDetail, IWarehouseExitMongoRepository } from '../Domain';
import {
    AuthUserDTO,
    collections,
    CreateWarehouseExitDTO,
    EmployeeENTITY,
    OrderDetailENTITY,
    ScrapingSystem,
    State,
    StateInventory,
    StateWarehouseStock,
    OrderStockENTITY,
    validateCustom,
    WarehouseExitENTITY,
    WarehouseStockENTITY
} from 'logiflowerp-sdk';
import { UseCaseInsertOne } from './UseCaseInsertOne';
import { createTenantScopedContainer } from '@Shared/Infrastructure/IoC';
import { WarehouseExitMongoRepository } from '../Infrastructure/MongoRepository';
import { collection } from '../Infrastructure/config';
import { UnprocessableEntityException } from '@Config/exception';

@injectable()
export class UseCaseAutomaticReplenishmentWin extends AddDetail {
    private idsOrderStock: string[] = []
    private resource_id!: string

    constructor(
        @inject(WAREHOUSE_EXIT_TYPES.RepositoryMongo) protected readonly repository: IWarehouseExitMongoRepository,
    ) {
        super(repository)
    }

    async exec(dto: CreateWarehouseExitDTO, user: AuthUserDTO, tenant: string) {
        await this.searchResourceId(dto)
        await this.createDocument(dto, user, tenant)
        do {
            const dataOrderStock = await this.getOrderStock()
            this.idsOrderStock = []
            await this.addDetail(dataOrderStock)
        } while (this.idsOrderStock.length)
        return this.repository.selectOne([{ $match: { _id: this.document._id } }])
    }

    private async addDetail(dataOrderStock: OrderStockENTITY[]) {
        for (const orderStock of dataOrderStock) {
            const pipeline = [{
                $match: {
                    'store.code': this.document.store.code,
                    'item.itemCode': orderStock.itemCode,
                    state: StateWarehouseStock.ACTIVO,
                    isDeleted: false
                }
            }]
            const warehouseStocks = await this.repository.select<WarehouseStockENTITY>(
                pipeline,
                collections.warehouseStock
            )
            if (warehouseStocks.length === 0) {
                continue
            }
            if (warehouseStocks.length === 1) {
                const result = await this.repository.validateAvailableWarehouseStocks({ _ids: [warehouseStocks[0]._id] })
                if (result.length !== 1) {
                    throw new Error(`Ocurrio un error al calcular disponible almacen _id: ${warehouseStocks[0]._id}`)
                }
                warehouseStocks[0].available = result[0].available
                if (result[0].available <= 0) {
                    continue
                }
                await this._addDetail(warehouseStocks[0], orderStock)
                continue
            }
            const results = await this.repository.validateAvailableWarehouseStocks({ _ids: warehouseStocks.map(e => e._id) })
            const _warehouseStocks = warehouseStocks
                .map(el => {
                    const stock = results.filter(e => e.keyDetail === el.keyDetail && e.keySearch === el.keySearch)
                    if (stock.length !== 1) {
                        throw new Error(
                            `Hay ${stock.length} resultados en validateAvailableWarehouseStocks keyDetail: ${el.keyDetail}, keySearch: ${el.keySearch}`
                        )
                    }
                    el.available = stock[0].available
                    return el
                })
                .filter(e => e.available > 0)
            if (_warehouseStocks.length === 0) {
                continue
            }
            const searchMatch = _warehouseStocks.find(e => e.available === orderStock.quantity)
            if (searchMatch) {
                await this._addDetail(searchMatch, orderStock)
                continue
            }
            const warehouseStock = _warehouseStocks.sort((a, b) => b.available - a.available)[0]
            await this._addDetail(warehouseStock, orderStock)
        }
    }

    private async _addDetail(
        warehouseStock: WarehouseStockENTITY,
        orderStock: OrderStockENTITY
    ) {
        const amount = Math.min(warehouseStock.available, orderStock.quantity)
        let newDetail: OrderDetailENTITY | null = null
        try {
            newDetail = await this.buildDetail(this.document, { amount, warehouseStock: warehouseStock })
        } catch (error) {
            if (!(error as Error).message.startsWith(this.msgExistDetail)) {
                throw error
            }
        }
        await this.createAndExecuteTransactions(newDetail, orderStock, amount, warehouseStock)
    }

    private async createAndExecuteTransactions(
        newDetail: OrderDetailENTITY | null,
        orderStock: OrderStockENTITY,
        amount: number,
        warehouseStock: WarehouseStockENTITY
    ) {
        const transactions: ITransaction<any>[] = []
        if (newDetail) {
            const transactionWarehouseExit: ITransaction<WarehouseExitENTITY> = {
                transaction: 'updateOne',
                filter: { _id: this.document._id },
                update: {
                    $push: { detail: newDetail }
                }
            }
            transactions.push(transactionWarehouseExit)
        } else {
            const transactionWarehouseExit: ITransaction<WarehouseExitENTITY> = {
                transaction: 'updateOne',
                filter: {
                    _id: this.document._id,
                    'detail.keyDetail': warehouseStock.keyDetail
                },
                update: {
                    $inc: { 'detail.$.amount': amount }
                }
            }
            transactions.push(transactionWarehouseExit)
        }
        const transactionOrderStock: ITransaction<OrderStockENTITY> = {
            collection: collections.winOrderStock,
            transaction: 'updateOne',
            filter: { _id: orderStock._id },
            update: {
                $set: { state_replacement: StateInventory.PROCESADO }
            }
        }
        transactions.push(transactionOrderStock)
        if (amount < orderStock.quantity) {
            const newDoc = new OrderStockENTITY()
            newDoc._id = crypto.randomUUID()
            newDoc.isDeleted = false
            newDoc.itemCode = orderStock.itemCode
            newDoc.numero_de_peticion = `DERIVADO CONSUMO ${orderStock.numero_de_peticion}`
            newDoc.quantity = orderStock.quantity - amount
            newDoc.serial = orderStock.serial
            newDoc.state_consumption = StateInventory.PROCESADO
            newDoc.state_replacement = StateInventory.PENDIENTE
            newDoc.stock_quantity_employee = []
            newDoc.resource_id = orderStock.resource_id

            const doc = await validateCustom(newDoc, OrderStockENTITY, UnprocessableEntityException)

            this.idsOrderStock.push(newDoc._id)

            const transactionOrderStock: ITransaction<OrderStockENTITY> = {
                collection: collections.winOrderStock,
                transaction: 'insertOne',
                doc
            }
            transactions.push(transactionOrderStock)
        }
        await this.repository.executeTransactionBatch(transactions)
        this.document = await this.repository.selectOne([{ $match: { _id: this.document._id } }])
    }

    private async getOrderStock() {
        const pipeline = [
            {
                $match: this.idsOrderStock.length
                    ? { _id: { $in: this.idsOrderStock } }
                    : {
                        resource_id: this.resource_id,
                        state_replacement: StateInventory.PENDIENTE,
                        invpool: 'install',
                        isDeleted: false,
                    }
            }
        ]
        const data = await this.repository.select<OrderStockENTITY>(
            pipeline,
            collections.winOrderStock
        )
        return data
    }

    private async createDocument(dto: CreateWarehouseExitDTO, user: AuthUserDTO, tenant: string) {
        const tenantContainer = createTenantScopedContainer(
            WAREHOUSE_EXIT_TYPES.UseCaseInsertOne,
            WAREHOUSE_EXIT_TYPES.RepositoryMongo,
            UseCaseInsertOne,
            WarehouseExitMongoRepository,
            tenant,
            collection,
            user
        )
        const useCase = tenantContainer.get<UseCaseInsertOne>(WAREHOUSE_EXIT_TYPES.UseCaseInsertOne)
        this.document = await useCase.exec(dto, user)
    }

    private async searchResourceId(dto: CreateWarehouseExitDTO) {
        const pipeline = [{ $match: { identity: dto.carrier.identity, isDeleted: false, state: State.ACTIVO } }]
        const result = await this.repository.selectOne<EmployeeENTITY>(
            pipeline,
            collections.employee
        )
        const resource_id = result.resourceSystem.filter(e => e.system === ScrapingSystem.WIN)
        if (resource_id.length !== 1) {
            throw new Error(`Hay ${resource_id.length} resultados para recurso id: ${ScrapingSystem.WIN}`)
        }
        this.resource_id = resource_id[0].resource_id
    }
}