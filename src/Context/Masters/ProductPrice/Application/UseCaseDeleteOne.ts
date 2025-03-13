import { IProductPriceMongoRepository } from '../Domain'

export class UseCaseDeleteOne {

    constructor(
        private readonly repository: IProductPriceMongoRepository,
    ) { }

    async exec(_id: string) {
        return this.repository.deleteOne({ _id })
    }

}