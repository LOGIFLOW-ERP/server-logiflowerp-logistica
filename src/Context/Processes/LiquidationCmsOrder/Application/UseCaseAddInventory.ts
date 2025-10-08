
import {
    CreateInventoryDTO,
    EmployeeENTITY,
    EmployeeStockSerialENTITY,
    InventoryToaDTO,
    ProducType,
    ProductENTITY,
    StateInventory,
    StateStockSerialEmployee,
    TOAOrderENTITY,
    collections,
    validateCustom
} from 'logiflowerp-sdk';
import {
    BadRequestException,
    UnprocessableEntityException
} from '@Config/exception';
import { inject, injectable } from 'inversify';
import { TOA_ORDER_TYPES } from '@Processes/ToaOrder/Infrastructure/IoC/types';
import { ITOAOrderMongoRepository } from '@Processes/ToaOrder/Domain';

@injectable()
export class UseCaseAddInventory {
    private transactions: ITransaction<any>[] = []

    constructor(
        @inject(TOA_ORDER_TYPES.RepositoryMongo) private readonly repository: ITOAOrderMongoRepository,
    ) { }

    async exec(_id: string, data: CreateInventoryDTO) {

        const document = await this.repository.selectOne([{ $match: { _id } }])
        if (document.estado_actividad === 'Completado') {
            throw new BadRequestException('No se puede agregar inventario a una orden de TOA que ya ha sido completada', true)
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
            invpool: 'install',
            invsn: data.invsn,
            invtype: '',
            lot: '',
            State_consumption: StateInventory.PENDIENTE,
            State_replacement: StateInventory.PENDIENTE,
        }

        const inventory = await validateCustom(newInventory, InventoryToaDTO, UnprocessableEntityException)

        if (document.inventory.some(e => e.code === data.code)) {
            throw new BadRequestException('El producto ya fue agregado a la orden', true)
        }

        const transaction: ITransaction<TOAOrderENTITY> = {
            transaction: 'updateOne',
            filter: { _id },
            update: {
                $push: { inventory }
            }
        }
        this.transactions.push(transaction)

        if (isSerie) {
            const pipelineEmployee = [{ $match: { toa_resource_id: document.toa_resource_id } }]
            const personel = await this.repository.selectOne<EmployeeENTITY>(pipelineEmployee, collections.employee)

            const pipeline = [{
                $match: {
                    itemCode: data.code,
                    state: StateStockSerialEmployee.POSESION,
                    keySearch: { $regex: 'Nuevo$', $options: 'i' },
                    identity: personel.identity,
                    serial: data.invsn
                }
            }]
            const stockSerial = await this.repository.selectOne<EmployeeStockSerialENTITY>(pipeline, collections.employeeStockSerial)

            const transaction: ITransaction<EmployeeStockSerialENTITY> = {
                collection: collections.employeeStockSerial,
                transaction: 'updateOne',
                filter: { _id: stockSerial._id },
                update: {
                    $set: { state: StateStockSerialEmployee.RESERVADO_CONSUMO_CMS }
                }
            }
            this.transactions.push(transaction)
        }
        
        return this.repository.executeTransactionBatch(this.transactions)
    }
}