import { AddDetail, IWarehouseEntryMongoRepository } from '../Domain';
import {
    CreateOrderDetailDTO,
    OrderDetailENTITY,
    ProducType,
    ProductENTITY,
    ProductPriceENTITY,
    State,
    StateOrder,
    StockSerialDTO,
    TokenPayloadDTO,
    WarehouseEntryENTITY,
    collections,
    validateCustom
} from 'logiflowerp-sdk';
import {
    ConflictException,
    TooManyRequestsException,
    UnprocessableEntityException
} from '@Config/exception';
import { WAREHOUSE_ENTRY_TYPES } from '../Infrastructure/IoC';
import { inject, injectable } from 'inversify';
import { UseCaseAddDetail } from './UseCaseAddDetail';
import { UseCaseAddSerial } from './UseCaseAddSerial';
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC';
import { AdapterRabbitMQ } from '@Shared/Infrastructure/Adapters';

@injectable()
export class UseCaseAddDetailBulk extends AddDetail {

    private document!: WarehouseEntryENTITY

    constructor(
        @inject(WAREHOUSE_ENTRY_TYPES.RepositoryMongo) private readonly repository: IWarehouseEntryMongoRepository,
        @inject(WAREHOUSE_ENTRY_TYPES.UseCaseAddDetail) private readonly useCaseAddDetail: UseCaseAddDetail,
        @inject(WAREHOUSE_ENTRY_TYPES.UseCaseAddSerial) private readonly useCaseAddSerial: UseCaseAddSerial,
        @inject(SHARED_TYPES.AdapterRabbitMQ) private readonly rabbitMQ: AdapterRabbitMQ,
    ) {
        super()
    }

    async exec(documentNumber: string, data: Record<string, any>[], user: TokenPayloadDTO) {
        try {
            await this.searchAndUpdateDocument(documentNumber, user)
            const cods = data.map(e => e['CodMaterial'].toString())
            const dataProduct = await this.getDataProduct(cods)
            const dataProductPrice = await this.getDataProductPrice(cods)
            const dataGroup = await this.groupProducts(data, dataProduct, dataProductPrice)

            const total = dataGroup.size
            let index = 0
            for (const [_key, det] of dataGroup) {
                ++index

                const { detail, serials } = det
                console.log(`🧩 [${index}/${total}] Agregando detalle: ${detail.keyDetail}`)

                await this.searchDocument(documentNumber)
                await this.useCaseAddDetail.exec(this.document._id, detail, this.document)

                if (detail.item.producType !== ProducType.SERIE) {
                    continue
                }

                for (const [i, serial] of serials.entries()) {
                    console.log(`   ↳ [${i + 1}/${serials.length}] Serie: ${serial.serial}`)

                    await this.searchDocument(documentNumber)
                    await this.useCaseAddSerial.exec(this.document._id, detail.keyDetail, serial, this.document)
                }
            }
            await this.repository.updateOne({ _id: this.document._id }, { $set: { state: StateOrder.REGISTRADO } })
            return await this.repository.selectOne([{ $match: { _id: this.document._id } }])
        } finally {
            await this.repository.updateOne({ _id: this.document._id }, { $set: { state: StateOrder.REGISTRADO } })
        }
    }

    private async groupProducts(
        data: Record<string, any>[],
        dataProduct: ProductENTITY[],
        dataProductPrice: ProductPriceENTITY[]
    ) {
        const mapa = new Map<string, { detail: OrderDetailENTITY; serials: StockSerialDTO[] }>()

        for (const [index, el] of data.entries()) {
            console.log(`GroupProducts >> Iteración ${index + 1} de ${data.length}`)

            const codMaterial = el['CodMaterial']?.toString()
            const cantidad = Number(el.Cantidad)
            if (cantidad <= 0) { continue }

            const product = dataProduct.find(e => e.itemCode === codMaterial)
            if (!product) {
                throw new Error(`No hay Producto con código "${codMaterial}"`)
            }

            const productPrice = dataProductPrice.find(e => e.itemCode === codMaterial)
            if (!productPrice) {
                throw new Error(`No hay precio producto con código "${codMaterial}"`)
            }

            const _dto = {
                amount: el.Cantidad,
                item: product,
                lot: ''
            }

            const dto = await validateCustom(_dto, CreateOrderDetailDTO, UnprocessableEntityException)
            const detail = await this.buildDetail(this.document, dto, productPrice)

            const key = detail.keyDetail

            if (!mapa.has(key)) {
                mapa.set(key, { detail, serials: [] })
            } else {
                const entry = mapa.get(key)!
                entry.detail.amount += dto.amount
            }

            if (product.producType !== ProducType.SERIE) {
                continue
            }

            if (dto.amount !== 1) {
                throw new Error(
                    `La cantidad para un producto seriado debe ser 1, código producto: ${detail.item.itemCode}${detail.lot ? `, Lote: ${detail.lot}` : ''}`
                )
            }

            const _serial = {
                brand: '',
                model: '',
                serial: el['Serie']
            }

            const serial = await validateCustom(_serial, StockSerialDTO, UnprocessableEntityException)

            mapa.get(key)!.serials.push(serial)
        }

        return mapa
    }

    private getDataProduct(cods: string[]) {
        const pipeline = [{ $match: { isDeleted: false, state: State.ACTIVO, itemCode: { $in: cods } } }]
        return this.repository.select<ProductENTITY>(pipeline, collections.product)
    }

    private getDataProductPrice(cods: string[]) {
        const pipeline = [{ $match: { itemCode: { $in: cods }, isDeleted: false } }]
        return this.repository.select<ProductPriceENTITY>(pipeline, collections.productPrice)
    }

    private async searchAndUpdateDocument(documentNumber: string, user: TokenPayloadDTO) {
        await this.searchDocument(documentNumber)
        if (this.document.state === StateOrder.PROCESANDO) {
            throw new TooManyRequestsException(
                `¡Se está procesando el detalle de este documento!`,
                true
            )
        }
        if (this.document.state !== StateOrder.REGISTRADO) {
            throw new ConflictException(
                `¡El estado de la orden para agregar detalle debe ser ${StateOrder.REGISTRADO}!`,
                true
            )
        }
        await this.repository.updateOne({ _id: this.document._id }, { $set: { state: StateOrder.PROCESANDO } })

        const msg = await this.createInfoNotification(
            user.user,
            `Ingreso — Doc. N.º ${this.document.documentNumber}: Inicio de carga masiva`,
            `Ingreso — Doc. N.º ${this.document.documentNumber}: Se inició el proceso de agregado masivo de detalles. Se le notificará el estado cuando finalice.`,
            this.invalidatesTags
        )
        await this.rabbitMQ.publish({ queue: this.queueNotification_UseCaseInsertOne, user, message: msg })
    }

    private async searchDocument(documentNumber: string) {
        const pipeline = [{ $match: { documentNumber } }]
        this.document = await this.repository.selectOne(pipeline)
    }
}