
import {
    AuthUserDTO,
    DeleteInventoryDTO,
    EmployeeENTITY,
    EmployeeStockENTITY,
    EmployeeStockSerialENTITY,
    ProducType,
    State,
    StateInternalOrderWin,
    StateOrderWin,
    StateStockSerialEmployee,
    WINOrderENTITY,
    collections,
} from 'logiflowerp-sdk';
import {
    BadRequestException
} from '@Config/exception';
import { inject, injectable } from 'inversify';
import { IWINOrderMongoRepository } from '@Processes/WinOrder/Domain';
import { WIN_ORDER_TYPES } from '@Processes/WinOrder/Infrastructure/IoC/types';

@injectable()
export class UseCaseDeleteInventory {
    private transactions: ITransaction<any>[] = []

    constructor(
        @inject(WIN_ORDER_TYPES.RepositoryMongo) private readonly repository: IWINOrderMongoRepository,
    ) { }

    async exec(_id: string, data: DeleteInventoryDTO) {
        const document = await this.repository.selectOne([{ $match: { _id } }])
        if (document.estado !== StateOrderWin.FINALIZADA || document.estado_interno !== StateInternalOrderWin.PENDIENTE) {
            throw new BadRequestException(
                `No se puede eliminar inventario la orden, su estado es ${document.estado} y su estado interno es ${document.estado_interno}`,
                true
            )
        }

        const employeeStock = await this.repository.selectOne<EmployeeStockENTITY>([{ $match: { _id: data._id_stock } }], collections.employeeStock)

        const transaction: ITransaction<WINOrderENTITY> = {
            transaction: 'updateOne',
            filter: { _id },
            update: {
                $pull: {
                    inventory: {
                        _id_stock: data._id_stock,
                        invsn: data.invsn
                    }
                }
            }
        }
        this.transactions.push(transaction)

        const isSerie = employeeStock.item.producType === ProducType.SERIE
        if (isSerie) {
            if (data.invsn.trim() === '') {
                throw new BadRequestException('El campo invsn es obligatorio para productos de tipo serie', true)
            }

            const pipeline = [{
                $match: {
                    isDeleted: false,
                    state: StateStockSerialEmployee.RESERVADO_CONSUMO,
                    keySearch: employeeStock.keySearch,
                    keyDetail: employeeStock.keyDetail,
                    identity: employeeStock.employee.identity,
                    serial: data.invsn
                }
            }]
            const stockSerial = await this.repository.selectOne<EmployeeStockSerialENTITY>(pipeline, collections.employeeStockSerial)

            const transaction: ITransaction<EmployeeStockSerialENTITY> = {
                collection: collections.employeeStockSerial,
                transaction: 'updateOne',
                filter: { _id: stockSerial._id },
                update: {
                    $set: {
                        state: StateStockSerialEmployee.POSESION,
                        documentNumber: document.numero_de_peticion,
                        updatedate: new Date()
                    }
                }
            }
            this.transactions.push(transaction)
        }

        return this.repository.executeTransactionBatch(this.transactions)
    }
}