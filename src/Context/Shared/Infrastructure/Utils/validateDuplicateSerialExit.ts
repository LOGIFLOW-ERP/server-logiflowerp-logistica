import { ConflictException } from '@Config/exception'
import { EmployeeStockSerialENTITY, StateStockSerialEmployee } from 'logiflowerp-sdk'

export function validateDuplicateSerialExit(
    dataEmployeeStockSerial: EmployeeStockSerialENTITY[],
    itemCode: string,
    serial: string
) {
    const states = [StateStockSerialEmployee.POSESION, StateStockSerialEmployee.RESERVADO]
    const stockSerialValidate = dataEmployeeStockSerial.some(
        e => e.itemCode === itemCode && e.serial === serial && states.includes(e.state)
    )
    if (stockSerialValidate) {
        throw new ConflictException(
            `La serie ${serial} en ${itemCode} ya está entregada y no se puede despachar nuevamente.`,
            true
        )
    }
}