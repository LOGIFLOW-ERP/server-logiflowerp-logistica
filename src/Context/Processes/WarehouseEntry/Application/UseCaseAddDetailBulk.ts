import { AddDetail, IWarehouseEntryMongoRepository } from '../Domain';
import {
    AuthUserDTO,
    CreateOrderDetailDTO,
    OrderDetailENTITY,
    ProducType,
    ProductENTITY,
    ProductPriceENTITY,
    State,
    StateOrder,
    StockSerialDTO,
    WarehouseEntryENTITY,
    collections,
    validateCustom
} from 'logiflowerp-sdk';
import {
    UnprocessableEntityException
} from '@Config/exception';
import { WAREHOUSE_ENTRY_TYPES } from '../Infrastructure/IoC';
import { inject, injectable } from 'inversify';
import { UseCaseAddDetail } from './UseCaseAddDetail';
import { UseCaseAddSerial } from './UseCaseAddSerial';
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC';
// import { AdapterSocket } from '@Shared/Infrastructure/Adapters';

@injectable()
export class UseCaseAddDetailBulk extends AddDetail {

    private document!: WarehouseEntryENTITY

    constructor(
        @inject(WAREHOUSE_ENTRY_TYPES.RepositoryMongo) private readonly repository: IWarehouseEntryMongoRepository,
        @inject(WAREHOUSE_ENTRY_TYPES.UseCaseAddDetail) private readonly useCaseAddDetail: UseCaseAddDetail,
        @inject(WAREHOUSE_ENTRY_TYPES.UseCaseAddSerial) private readonly useCaseAddSerial: UseCaseAddSerial,
        // @inject(SHARED_TYPES.AdapterSocket) private readonly socket: AdapterSocket
    ) {
        super()
    }

    async exec(_id: string, data: Record<string, any>[], user: AuthUserDTO) {
        await this.searchDocument(_id)
        const cods = data.map(e => e['CodMaterial'].toString())
        const dataProduct = await this.getDataProduct(cods)
        const dataProductPrice = await this.getDataProductPrice(cods)
        const dataGroup = await this.groupProducts(_id, data, dataProduct, dataProductPrice)
        for (const [_key, det] of dataGroup) {
            const { detail, serials } = det
            await this.useCaseAddDetail.exec(_id, detail)

            if (detail.item.producType !== ProducType.SERIE) {
                continue
            }

            for (const serial of serials) {
                await this.useCaseAddSerial.exec(_id, detail.keyDetail, serial)
            }
        }
        // this.socket.getIO().to(`user:${user._id}`).emit('order:completed', { _id });
        return this.repository.selectOne([{ $match: { _id } }])
    }

    private async groupProducts(
        _id: string,
        data: Record<string, any>[],
        dataProduct: ProductENTITY[],
        dataProductPrice: ProductPriceENTITY[]
    ) {
        const mapa = new Map<string, { detail: OrderDetailENTITY; serials: StockSerialDTO[] }>()

        for (const el of data) {
            const codMaterial = el['CodMaterial']?.toString()
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
                throw new Error(`La cantidad para un producto seriado debe ser 1`)
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

    private async searchDocument(_id: string) {
        const pipeline = [{ $match: { _id, state: { $ne: StateOrder.VALIDADO } } }]
        this.document = await this.repository.selectOne(pipeline)
    }
}