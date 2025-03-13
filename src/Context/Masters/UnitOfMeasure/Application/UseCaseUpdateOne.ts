import { IUnitOfMeasureMongoRepository } from '../Domain'
import { UpdateUnitOfMeasureDTO } from 'logiflowerp-sdk'

export class UseCaseUpdateOne {

    constructor(
        private readonly repository: IUnitOfMeasureMongoRepository,
    ) { }

    async exec(_id: string, dto: UpdateUnitOfMeasureDTO) {
        return this.repository.updateOne({ _id }, { $set: dto })
    }

}