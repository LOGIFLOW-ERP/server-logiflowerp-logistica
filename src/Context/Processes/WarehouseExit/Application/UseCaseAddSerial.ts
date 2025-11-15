import { AddSerial, IWarehouseExitMongoRepository } from '../Domain';
import {
    StateOrder,
    StockSerialDTO,
} from 'logiflowerp-sdk';
import { WAREHOUSE_EXIT_TYPES } from '../Infrastructure/IoC';
import { inject, injectable } from 'inversify';

@injectable()
export class UseCaseAddSerial extends AddSerial {
    constructor(
        @inject(WAREHOUSE_EXIT_TYPES.RepositoryMongo) protected readonly repository: IWarehouseExitMongoRepository,
    ) {
        super(repository)
    }

    async exec(_id: string, keyDetail: string, dto: StockSerialDTO) {
        await this.searchDocument(_id)
        const transactions = await this.buildTransactionsAddDetail(keyDetail, dto)
        await this.repository.executeTransactionBatch(transactions)
        return this.repository.selectOne([{ $match: { _id: this.document._id } }])
    }

    private async searchDocument(_id: string) {
        const pipeline = [{ $match: { _id, state: { $ne: StateOrder.VALIDADO } } }]
        this.document = await this.repository.selectOne(pipeline)
    }
}