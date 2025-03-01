import { inject, injectable } from 'inversify'
import { PRODUCT_PRICE_TYPES } from '../Infrastructure/IoC'
import { IProductPriceMongoRepository } from '../Domain'
@injectable()
export class UseCaseDeleteOne {

    constructor(
        @inject(PRODUCT_PRICE_TYPES.MongoRepository) private readonly repository: IProductPriceMongoRepository,
    ) { }

    async exec(_id: string) {
        return this.repository.deleteOne({ _id })
    }

}