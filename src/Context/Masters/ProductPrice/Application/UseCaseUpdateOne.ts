import { inject, injectable } from 'inversify'
import { PRODUCT_PRICE_TYPES } from '../Infrastructure/IoC'
import { IProductPriceMongoRepository } from '../Domain'
import { UpdateProductPriceDTO } from 'logiflowerp-sdk'

@injectable()
export class UseCaseUpdateOne {

    constructor(
        @inject(PRODUCT_PRICE_TYPES.MongoRepository) private readonly repository: IProductPriceMongoRepository,
    ) { }

    async exec(_id: string, dto: UpdateProductPriceDTO) {
        return this.repository.updateOne({ _id }, { $set: dto })
    }

}