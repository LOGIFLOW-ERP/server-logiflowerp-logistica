import { IWarehouseEntryMongoRepository } from '../Domain';
import { AuthUserDTO, ItemWorkflowOrderDTO, StateOrder, WarehouseEntryENTITY, validateCustom } from 'logiflowerp-sdk';
import { BadRequestException, ConflictException, NotFoundException, UnprocessableEntityException } from '@Config/exception';
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
        await this.createTransactionDocument(user)
        return this.repository.executeTransactionBatch(this.transactions)
    }

    private async searchDocument(_id: string) {
        const doc = await this.repository.select([{ $match: { _id } }])
        if (doc.length === 0) {
            throw new NotFoundException('Documento no encontrado', true)
        }
        if (doc.length > 1) {
            throw new ConflictException('Se encontraron múltiples documentos con el mismo ID', true)
        }
        this.document = doc[0]
        if (this.document.state === StateOrder.VALIDADO) {
            throw new ConflictException('No se puede validar un ingreso validado', true)
        }
        if (this.document.detail.length === 0) {
            throw new BadRequestException('No se puede validar un ingreso sin detalle', true)
        }
    }

    private async createTransactionDocument(user: AuthUserDTO) {
        const validation = new ItemWorkflowOrderDTO()
        validation.date = new Date()
        validation.user = user
        const transaction: ITransaction<WarehouseEntryENTITY> = {
            transaction: 'updateOne',
            filter: { _id: this.document._id },
            update: {
                $set: {
                    state: StateOrder.VALIDADO,
                    'workflow.validation': await validateCustom(
                        validation,
                        ItemWorkflowOrderDTO,
                        UnprocessableEntityException
                    )
                }
            }
        }
        this.transactions.push(transaction)
    }

}