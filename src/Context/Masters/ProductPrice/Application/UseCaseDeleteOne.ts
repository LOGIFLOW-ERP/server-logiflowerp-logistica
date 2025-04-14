import { inject, injectable } from 'inversify'
import { IProductPriceMongoRepository } from '../Domain'
import { PRODUCT_PRICE_TYPES } from '../Infrastructure/IoC'

@injectable()
export class UseCaseDeleteOne {

    constructor(
        @inject(PRODUCT_PRICE_TYPES.RepositoryMongo) private readonly repository: IProductPriceMongoRepository,
    ) { }

    async exec(_id: string) {
        return this.repository.deleteOne({ _id })
    }

}