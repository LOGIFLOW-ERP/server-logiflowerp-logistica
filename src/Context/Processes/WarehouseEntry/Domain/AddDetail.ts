import { UnprocessableEntityException } from '@Config/exception'
import {
    CreateOrderDetailDTO,
    OrderDetailENTITY,
    ProductPriceENTITY,
    validateCustom,
    WarehouseEntryENTITY
} from 'logiflowerp-sdk'

export class AddDetail {
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