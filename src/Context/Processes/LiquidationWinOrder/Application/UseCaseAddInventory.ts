
import {
    AuthUserDTO,
    CreateInventoryDTO,
    EmployeeStockENTITY,
    EmployeeStockSerialENTITY,
    InventoryWinDTO,
    ProducType,
    StateInternalOrderWin,
    StateOrderWin,
    StateStockSerialEmployee,
    WINOrderENTITY,
    collections,
    validateCustom
} from 'logiflowerp-sdk';
import {
    BadRequestException,
    UnprocessableEntityException
} from '@Config/exception';
import { inject, injectable } from 'inversify';
import { IWINOrderMongoRepository } from '@Processes/WinOrder/Domain';
import { WIN_ORDER_TYPES } from '@Processes/WinOrder/Infrastructure/IoC/types';

@injectable()
export class UseCaseAddInventory {
    private transactions: ITransaction<any>[] = []

    constructor(
        @inject(WIN_ORDER_TYPES.RepositoryMongo) private readonly repository: IWINOrderMongoRepository,
    ) { }

    async exec(_id: string, data: CreateInventoryDTO, user: AuthUserDTO) {
        const document = await this.repository.selectOne([{ $match: { _id } }])
        if (document.estado !== StateOrderWin.FINALIZADA || document.estado_interno !== StateInternalOrderWin.PENDIENTE) {
            throw new BadRequestException(
                `No se puede agregar inventario la orden, su estado es ${document.estado} y su estado interno es ${document.estado_interno}`,
                true
            )
        }
        if (data.quantity <= 0) {
            throw new BadRequestException('El campo cantidad debe ser mayor a 0', true)
        }

        const employeeStock = await this.repository.selectOne<EmployeeStockENTITY>([{ $match: { _id: data._id_stock } }], collections.employeeStock)

        const isSerie = employeeStock.item.producType === ProducType.SERIE

        if (isSerie) {
            if (data.invsn.trim() === '') {
                throw new BadRequestException('El campo invsn es obligatorio para productos de tipo serie', true)
            }
            if (data.quantity !== 1) {
                throw new BadRequestException('El campo cantidad debe ser igual a 1 para productos de tipo serie', true)
            }
        }

        const newInventory = {
            code: employeeStock.item.itemCode,
            description: employeeStock.item.itemName,
            quantity: data.quantity,
            invsn: data.invsn,
            invpool: 'install',
            _id_stock: data._id_stock
        }

        const inventory = await validateCustom(newInventory, InventoryWinDTO, UnprocessableEntityException)

        if (document.inventory.some(e => e._id_stock === data._id_stock)) {
            throw new BadRequestException('El producto ya fue agregado a la orden', true)
        }

        await this.validateAvailableStockEmployee(data._id_stock, inventory.quantity)

        const transaction: ITransaction<WINOrderENTITY> = {
            transaction: 'updateOne',
            filter: { _id },
            update: {
                $push: { inventory }
            }
        }
        this.transactions.push(transaction)

        if (isSerie) {
            const pipeline = [{
                $match: {
                    isDeleted: false,
                    state: StateStockSerialEmployee.POSESION,
                    keySearch: employeeStock.keySearch,
                    keyDetail: employeeStock.keyDetail,
                    identity: user.identity,
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
                        state: StateStockSerialEmployee.RESERVADO_CONSUMO,
                        documentNumber: document.numero_de_peticion,
                        updatedate: new Date()
                    }
                }
            }
            this.transactions.push(transaction)
        }

        return this.repository.executeTransactionBatch(this.transactions)
    }

    private async validateAvailableStockEmployee(_id: string, amount: number) {
        const result = await this.repository.validateAvailableEmployeeStocks({ _ids: [_id] })
        const available = result[0].available
        if (amount > available) {
            throw new BadRequestException(
                `La cantidad a liquidar (${amount}) excede el stock disponible (${available}).`,
                true
            )
        }
    }
}