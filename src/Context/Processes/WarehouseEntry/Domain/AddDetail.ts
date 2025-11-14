import { UnprocessableEntityException } from '@Config/exception'
import { CommonNotification } from '@Shared/Domain'
import {
    CreateOrderDetailDTO,
    OrderDetailENTITY,
    ProductPriceENTITY,
    validateCustom,
    WarehouseEntryENTITY
} from 'logiflowerp-sdk'

export class AddDetail extends CommonNotification {
    protected path = 'processes/warehouseEntry'
    protected api = 'warehouseEntryApi'
    protected invalidatesTags = [
        { api: this.api, type: this.path, id: `LIST${this.path}` },
        { api: this.api, type: this.path, id: `LIST1${this.path}` },
        { api: this.api, type: this.path, id: `STATIC_PIPELINE${this.path}` },
        { api: this.api, type: this.path, id: `PIPELINE${this.path}` },
    ]

    protected buildDetail(document: WarehouseEntryENTITY, dto: CreateOrderDetailDTO, productPrice: ProductPriceENTITY) {
        const lastPosition = document.detail.reduce((acc, item) => Math.max(acc, item.position), 0)
        const detail = new OrderDetailENTITY()
        detail.set(dto)
        detail.codeStore = document.store.code
        detail.stockType = document.movement.stockType
        detail.position = lastPosition + 1
        detail.price = productPrice
        return validateCustom(detail, OrderDetailENTITY, UnprocessableEntityException)
    }
}