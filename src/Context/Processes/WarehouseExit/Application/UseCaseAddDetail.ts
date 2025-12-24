import { AddDetail, IWarehouseExitMongoRepository } from '../Domain'
import {
    CreateWarehouseExitDetailDTO,
    StateOrder,
} from 'logiflowerp-sdk'
import { WAREHOUSE_EXIT_TYPES } from '../Infrastructure/IoC'
import { inject, injectable } from 'inversify'

@injectable()
export class UseCaseAddDetail extends AddDetail {
    constructor(
        @inject(WAREHOUSE_EXIT_TYPES.RepositoryMongo) protected readonly repository: IWarehouseExitMongoRepository,
    ) {
        super(repository)
    }

    async exec(_id: string, dto: CreateWarehouseExitDetailDTO) {
        await this.searchDocument(_id)
        const newDetail = await this.buildDetail(this.document, dto)
        return this.repository.updateOne({ _id }, { $push: { detail: newDetail } })
    }

    private async searchDocument(_id: string) {
        const pipeline = [{ $match: { _id, state: { $ne: StateOrder.VALIDADO } } }]
        this.document = await this.repository.selectOne(pipeline)
    }
}