import { ConflictException } from '@Config/exception'
import { StateStockSerialWarehouse, WarehouseStockSerialENTITY } from 'logiflowerp-sdk'

export function validateDuplicateSerialEntry(
    dataWarehouseStockSerial: WarehouseStockSerialENTITY[],
    itemCode: string,
    serial: string
) {
    const states = [StateStockSerialWarehouse.DISPONIBLE, StateStockSerialWarehouse.RESERVADO]
    const stockSerialValidate = dataWarehouseStockSerial.some(
        e => e.itemCode === itemCode && e.serial === serial && states.includes(e.state)
    )
    if (stockSerialValidate) {
        throw new ConflictException(
            `La serie ${serial} en ${itemCode} ya está registrado y no se puede ingresar nuevamente.`,
            true
        )
    }
}