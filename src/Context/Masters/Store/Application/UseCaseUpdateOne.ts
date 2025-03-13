import { IStoreMongoRepository } from '../Domain'
import { UpdateStoreDTO } from 'logiflowerp-sdk'

export class UseCaseUpdateOne {

    constructor(
        private readonly repository: IStoreMongoRepository,
    ) { }

    async exec(_id: string, dto: UpdateStoreDTO) {
        return this.repository.updateOne({ _id }, { $set: dto })
    }

}