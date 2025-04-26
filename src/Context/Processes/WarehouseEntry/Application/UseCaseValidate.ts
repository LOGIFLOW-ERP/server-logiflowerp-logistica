import { IWarehouseEntryMongoRepository } from '../Domain';
import {
    AuthUserDTO,
    ItemWorkflowOrderDTO,
    ProducType,
    ProductPriceDTO,
    ProductPriceENTITY,
    StateOrder,
    WarehouseEntryENTITY,
    collections,
    validateCustom
} from 'logiflowerp-sdk';
import {
    BadRequestException,
    ConflictException,
    NotFoundException,
    UnprocessableEntityException
} from '@Config/exception';
import { WAREHOUSE_ENTRY_TYPES } from '../Infrastructure/IoC';
import { inject, injectable } from 'inversify';

@injectable()
export class UseCaseValidate {

    private document!: WarehouseEntryENTITY
    private transactions: ITransaction<any>[] = []

    constructor(
        @inject(WAREHOUSE_ENTRY_TYPES.RepositoryMongo) private readonly repository: IWarehouseEntryMongoRepository,
    ) { }

    async exec(_id: string, user: AuthUserDTO) {
        await this.searchDocument(_id)
        const dataProductPrices = await this.searchProductPrice()
        await this.updateDocument(dataProductPrices, user)
        await this.createTransactionDocument()
        return this.repository.executeTransactionBatch(this.transactions)
    }

    private async searchDocument(_id: string) {
        const pipeline = [{ $match: { _id, state: { $ne: StateOrder.VALIDADO } } }]
        this.document = await this.repository.selectOne(pipeline)
        if (this.document.detail.length === 0) {
            throw new BadRequestException('No se puede validar un ingreso sin detalle', true)
        }
    }

    private searchProductPrice() {
        const pipeline = [{ $match: { itemCode: { $in: this.document.detail.map(e => e.item.itemCode) } } }]
        return this.repository.select<ProductPriceENTITY>(pipeline, collections.productPrice)
    }

    private async updateDocument(dataProductPrices: ProductPriceENTITY[], user: AuthUserDTO) {
        for (const [i, detail] of this.document.detail.entries()) {

            if (detail.amount <= 0) {
                throw new UnprocessableEntityException(
                    `La cantidad del detalle debe ser mayor a cero para el código de ítem: ${detail.item.itemCode}`,
                    true
                )
            }

            if (detail.item.producType === ProducType.SERIE && detail.serials.length !== detail.amount) {
                throw new UnprocessableEntityException(
                    `La cantidad de series registradas no coincide con la cantidad solicitada para el código de ítem: ${detail.item.itemCode}`,
                    true
                )
            }

            const productPrice = dataProductPrices.find(e => e.itemCode === detail.item.itemCode)
            if (!productPrice) {
                throw new NotFoundException(`Precio de producto no encontrado para el código de ítem: ${detail.item.itemCode}`, true)
            }

            detail.price = await validateCustom(productPrice, ProductPriceDTO, UnprocessableEntityException)
            detail.position = i + 1
        }
        const validation = new ItemWorkflowOrderDTO()
        validation.date = new Date()
        validation.user = user
        this.document.workflow.validation = await validateCustom(validation, ItemWorkflowOrderDTO, UnprocessableEntityException)
    }

    private async createTransactionDocument() {
        const transaction: ITransaction<WarehouseEntryENTITY> = {
            transaction: 'updateOne',
            filter: { _id: this.document._id },
            update: {
                $set: {
                    state: StateOrder.VALIDADO,
                    detail: this.document.detail,
                    'workflow.validation': this.document.workflow.validation
                }
            }
        }
        this.transactions.push(transaction)
    }

    //#region Stock almacen
    /**
     * si hay la serie y esa serie está disponible o reservado da error
     * 
     */
    //#endregion

}