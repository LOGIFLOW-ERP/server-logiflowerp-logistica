import { ConflictException } from '@Config/exception'
import { StateStockSerialWarehouse, WarehouseStockSerialENTITY } from 'logiflowerp-sdk'

export function validateDuplicateSerialReturn(
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
            `La serie ${serial} en ${itemCode} ya se encuentra ${StateStockSerialWarehouse.DISPONIBLE} o ${StateStockSerialWarehouse.RESERVADO} y no se puede retornar nuevamente.`,
            true
        )
    }
}