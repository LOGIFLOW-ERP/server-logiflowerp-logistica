import { IProductGroupMongoRepository } from '../Domain'
import { UpdateProductGroupDTO } from 'logiflowerp-sdk'

export class UseCaseUpdateOne {

    constructor(
        private readonly repository: IProductGroupMongoRepository,
    ) { }

    async exec(_id: string, dto: UpdateProductGroupDTO) {
        return this.repository.updateOne({ _id }, { $set: dto })
    }

}