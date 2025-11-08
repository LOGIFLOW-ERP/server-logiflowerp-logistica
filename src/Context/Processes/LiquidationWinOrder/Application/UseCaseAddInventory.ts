
import {
    AuthUserDTO,
    CreateInventoryDTO,
    EmployeeStockSerialENTITY,
    InventoryWinDTO,
    ProducType,
    ProductENTITY,
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

        const product = await this.repository.selectOne<ProductENTITY>([{ $match: { itemCode: data.code } }], collections.product)

        const isSerie = product.producType === ProducType.SERIE

        if (isSerie) {
            if (data.invsn.trim() === '') {
                throw new BadRequestException('El campo invsn es obligatorio para productos de tipo serie', true)
            }
            if (data.quantity !== 1) {
                throw new BadRequestException('El campo cantidad debe ser igual a 1 para productos de tipo serie', true)
            }
        }

        const newInventory = {
            code: data.code,
            description: product.itemName,
            quantity: data.quantity,
            invsn: data.invsn,
            invpool: 'install'
        }

        const inventory = await validateCustom(newInventory, InventoryWinDTO, UnprocessableEntityException)

        if (document.inventory.some(e => e.code === data.code && e.invsn === data.invsn)) {
            throw new BadRequestException('El producto ya fue agregado a la orden', true)
        }

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
                    itemCode: data.code,
                    state: StateStockSerialEmployee.POSESION,
                    keySearch: { $regex: 'Nuevo$', $options: 'i' },
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
}