import { IProductPriceMongoRepository } from '../Domain'
import { UpdateProductPriceDTO } from 'logiflowerp-sdk'

export class UseCaseUpdateOne {

    constructor(
        private readonly repository: IProductPriceMongoRepository,
    ) { }

    async exec(_id: string, dto: UpdateProductPriceDTO) {
        return this.repository.updateOne({ _id }, { $set: dto })
    }

}