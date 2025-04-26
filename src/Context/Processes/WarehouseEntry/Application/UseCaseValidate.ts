import { IWarehouseEntryMongoRepository } from '../Domain';
import { AuthUserDTO, ItemWorkflowOrderDTO, StateOrder, WarehouseEntryENTITY, validateCustom } from 'logiflowerp-sdk';
import { BadRequestException, ConflictException, UnprocessableEntityException } from '@Config/exception';
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
        this.updateDocument()
        await this.createTransactionDocument(user)
        return this.repository.executeTransactionBatch(this.transactions)
    }

    private async searchDocument(_id: string) {
        this.document = await this.repository.selectOne([{ $match: { _id } }])
        if (this.document.state === StateOrder.VALIDADO) {
            throw new ConflictException('No se puede validar un ingreso validado', true)
        }
        if (this.document.detail.length === 0) {
            throw new BadRequestException('No se puede validar un ingreso sin detalle', true)
        }
    }

    private updateDocument() {
        for (const [i, detail] of this.document.detail.entries()) {
            detail.position = i + 1
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
                    detail: this.document.detail,
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