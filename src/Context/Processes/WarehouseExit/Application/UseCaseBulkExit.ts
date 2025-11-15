import { IWarehouseExitMongoRepository } from '../Domain';
import {
    AuthUserDTO,
    CreateWarehouseExitDTO,
    CreateWarehouseExitDetailDTO,
    EmployeeENTITY,
    MovementENTITY,
    MovementOrder,
    OrderDetailENTITY,
    ProducType,
    ProductENTITY,
    State,
    StateWarehouseStock,
    StockSerialDTO,
    StockType,
    StoreDTO,
    StoreENTITY,
    WarehouseStockENTITY,
    buildKeyDetail,
    buildKeySearch,
    collections,
    validateCustom
} from 'logiflowerp-sdk';
import { UnprocessableEntityException } from '@Config/exception';
import { WAREHOUSE_EXIT_TYPES } from '../Infrastructure/IoC';
import { inject, injectable } from 'inversify';
import { UseCaseInsertOne } from './UseCaseInsertOne';
import fs from "fs";
import { UseCaseAddDetail } from './UseCaseAddDetail';
import { UseCaseAddSerial } from './UseCaseAddSerial';
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC';
import { AdapterMail } from '@Shared/Infrastructure/Adapters';

type Det = Pick<OrderDetailENTITY, 'keySearch' | 'keyDetail' | 'amount' | 'item'> & { serials: string[] }

@injectable()
export class UseCaseBulkExit {
    private logs = new Set<string>()

    constructor(
        @inject(WAREHOUSE_EXIT_TYPES.RepositoryMongo) private readonly repository: IWarehouseExitMongoRepository,
        @inject(WAREHOUSE_EXIT_TYPES.UseCaseInsertOne) private readonly useCaseInsertOne: UseCaseInsertOne,
        @inject(WAREHOUSE_EXIT_TYPES.UseCaseAddDetail) private readonly useCaseAddDetail: UseCaseAddDetail,
        @inject(WAREHOUSE_EXIT_TYPES.UseCaseAddSerial) private readonly useCaseAddSerial: UseCaseAddSerial,
        @inject(SHARED_TYPES.AdapterMail) private readonly adapterMail: AdapterMail,
    ) {

    }

    async exec(payload: { store: StoreDTO, data: Record<string, any>[] }, user: AuthUserDTO, ticket: string) {
        try {
            const { data, store } = payload
            const codsProd = data.map(e => e['CodMaterial'].toString())
            const dataProduct = await this.getDataProduct(codsProd)
            const codsEmp = data.map(e => e.Tecnico.toString())
            const dataEmployee = await this.getDataEmployee(codsEmp)
            const _store = await this.getStore(store)
            const { dataGroup, keysDetail, keysSearch } = await this.groupProducts(data, dataProduct, dataEmployee, store)
            const movement = await this.getMovimiento()
            await this.process(
                dataGroup,
                keysSearch,
                keysDetail,
                movement,
                store,
                user,
                _store
            )
        } finally {
            const HTMLMessage = Array.from(this.logs).join("\n")
            const subject = `Salida — Ticket N° ${ticket}: Logs del proceso`
            await this.adapterMail.send(user.email, subject, HTMLMessage, undefined)
        }
    }

    private async process(
        dataMapa: Map<string, { employee: EmployeeENTITY; detalle: Det[]; }>,
        keysSearch: string[],
        keysDetail: string[],
        movement: MovementENTITY,
        store: StoreDTO,
        user: AuthUserDTO,
        _store: StoreENTITY
    ) {
        const dataWarehouseStocks = await this.searchWarehouseStocks(store, keysSearch, keysDetail)
        let index = 0
        const total = dataMapa.size
        for (const [key, el] of dataMapa) {
            ++index
            console.log(`🧩 [${index}/${total}] Creando salida técnico: ${key}`)

            try {
                const { detalle, employee } = el

                const _dto = {
                    address: _store.address,
                    carrier: employee,
                    movement,
                    store
                }
                const dto = await validateCustom(_dto, CreateWarehouseExitDTO, UnprocessableEntityException)
                const document = await this.useCaseInsertOne.exec(dto, user)

                for (const [i, det] of detalle.entries()) {
                    console.log(`   ↳ [${index}/${total}] salida, [${i + 1}/${detalle.length}] agregando detalle: ${det.item.itemCode}`)
                    try {
                        const warehouseStock = dataWarehouseStocks.find(ws => ws.keyDetail === det.keyDetail && ws.keySearch === det.keySearch)
                        if (!warehouseStock) {
                            this.logs.add(`No hay stock almacén, código producto: ${det.item.itemCode}, código almacén: ${store.code}`)
                            continue
                        }
                        const _dto: CreateWarehouseExitDetailDTO = {
                            amount: det.amount,
                            warehouseStock
                        }
                        const dto = await validateCustom(_dto, CreateWarehouseExitDetailDTO, UnprocessableEntityException)
                        await this.useCaseAddDetail.exec(document._id, dto)
                        for (const [j, serial] of det.serials.entries()) {
                            console.log(`       ↳ [${index}/${total}] salida, [${i + 1}/${detalle.length}] detalle, [${j + 1}/${det.serials.length}] agregando serie: ${serial}`)
                            try {
                                const _dto = {
                                    brand: '',
                                    model: '',
                                    serial
                                }
                                const dto = await validateCustom(_dto, StockSerialDTO, UnprocessableEntityException)
                                await this.useCaseAddSerial.exec(document._id, det.keyDetail, dto)
                            } catch (error) {
                                this.logs.add(`No se agregó serie ${serial}, producto: ${det.item.itemCode}, personal: ${key} (${(error as Error).message})`)
                            }
                        }
                    } catch (error) {
                        this.logs.add(`No se agregó detalle producto: ${det.item.itemCode}, personal: ${key} (${(error as Error).message})`)
                    }
                }
            } catch (error) {
                this.logs.add(`No se creó doc de salida, personal: ${key} (${(error as Error).message})`)
            }
        }
    }

    private async groupProducts(
        data: Record<string, any>[],
        dataProduct: ProductENTITY[],
        dataEmployee: EmployeeENTITY[],
        store: StoreDTO
    ) {
        const mapa = new Map<string, { employee: EmployeeENTITY, detalle: Det[] }>()
        const keysSearch = new Set<string>()
        const keysDetail = new Set<string>()

        for (const [index, el] of data.entries()) {
            console.log(`GroupProducts >> Iteración ${index + 1} de ${data.length}`)

            const codMaterial = el.CodMaterial?.toString()
            const cantidad = Number(el.Cantidad)
            const serie = el.Serie
            const tecnico = el.Tecnico

            if (tecnico === 'ALMACEN') { continue }

            const labelLog = `Código Material: ${codMaterial}, Serie: ${serie ?? ''}, Técnico: ${tecnico}${serie ? `, Serie: ${serie}.` : ''}`

            if (cantidad <= 0) {
                this.logs.add(`La cantidad es ${cantidad}, error en linea ${labelLog}`)
                continue
            }

            const employee = dataEmployee.find(e => e.identity === tecnico)
            if (!employee) {
                this.logs.add(`No hay personal ${tecnico} en catálogo`)
                continue
            }

            const product = dataProduct.find(e => e.itemCode === codMaterial)
            if (!product) {
                this.logs.add(`No hay producto ${codMaterial} en catálogo`)
                continue
            }

            if (product.producType === ProducType.SERIE && cantidad !== 1) {
                this.logs.add(`La cantidad para un producto seriado debe ser 1 en ${labelLog}`)
                continue
            }

            const keySearch = buildKeySearch(store.code, StockType.NUEVO)
            const keyDetail = buildKeyDetail(product, '')

            keysSearch.add(keySearch)
            keysDetail.add(keyDetail)

            const detail: Det = {
                amount: cantidad,
                keyDetail,
                keySearch,
                serials: product.producType === ProducType.SERIE ? [serie] : [],
                item: product
            }

            if (!mapa.has(tecnico)) {
                mapa.set(tecnico, { detalle: [detail], employee })
            } else {
                const entry = mapa.get(tecnico)!
                const existDet = entry.detalle.find(e => e.keyDetail === keyDetail && e.keySearch === keySearch)
                if (existDet) {
                    existDet.amount += detail.amount
                    existDet.serials = [...existDet.serials, ...detail.serials]
                } else {
                    entry.detalle.push(detail)
                }
            }
        }

        // const obj = Object.fromEntries(mapa)
        // fs.writeFileSync("logiflow_mapa.json", JSON.stringify(obj, null, 2), "utf-8")
        return { dataGroup: mapa, keysSearch: Array.from(keysSearch), keysDetail: Array.from(keysDetail) }
    }

    private searchWarehouseStocks(
        store: StoreDTO,
        keysSearch: string[],
        keysDetail: string[],
    ) {
        const pipeline = [
            {
                $match: {
                    keySearch: { $in: keysSearch },
                    keyDetail: { $in: keysDetail },
                    'store.code': store.code,
                    state: StateWarehouseStock.ACTIVO,
                    isDeleted: false
                }
            }
        ]
        return this.repository.select<WarehouseStockENTITY>(pipeline, collections.warehouseStock)
    }

    private getDataProduct(cods: string[]) {
        const pipeline = [{ $match: { isDeleted: false, state: State.ACTIVO, itemCode: { $in: cods } } }]
        return this.repository.select<ProductENTITY>(pipeline, collections.product)
    }

    private getDataEmployee(codsEmp: string[]) {
        const pipeline = [{ $match: { isDeleted: false, state: State.ACTIVO, identity: { $in: codsEmp } } }]
        return this.repository.select<EmployeeENTITY>(pipeline, collections.employee)
    }

    private getMovimiento(code: string = '261') {
        const pipeline = [{ $match: { code, isDeleted: false, movement: MovementOrder.SALIDA, stockType: StockType.NUEVO } }]
        return this.repository.selectOne<MovementENTITY>(pipeline, collections.movement)
    }

    private getStore(store: StoreDTO) {
        const pipeline = [{ $match: { code: store.code, state: State.ACTIVO } }]
        return this.repository.selectOne<StoreENTITY>(pipeline, collections.store)
    }
}