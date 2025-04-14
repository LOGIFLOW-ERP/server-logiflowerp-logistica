import { inject, injectable } from 'inversify'
import { IProductPriceMongoRepository } from '../Domain'
import { UpdateProductPriceDTO } from 'logiflowerp-sdk'
import { PRODUCT_PRICE_TYPES } from '../Infrastructure/IoC'

@injectable()
export class UseCaseUpdateOne {

    constructor(
        @inject(PRODUCT_PRICE_TYPES.RepositoryMongo) private readonly repository: IProductPriceMongoRepository,
    ) { }

    async exec(_id: string, dto: UpdateProductPriceDTO) {
        return this.repository.updateOne({ _id }, { $set: dto })
    }

}