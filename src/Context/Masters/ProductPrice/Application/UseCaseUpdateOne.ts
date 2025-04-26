import { inject, injectable } from 'inversify'
import { IProductPriceMongoRepository } from '../Domain'
import { collections, ProductENTITY, State, UpdateProductPriceDTO } from 'logiflowerp-sdk'
import { PRODUCT_PRICE_TYPES } from '../Infrastructure/IoC'

@injectable()
export class UseCaseUpdateOne {

    constructor(
        @inject(PRODUCT_PRICE_TYPES.RepositoryMongo) private readonly repository: IProductPriceMongoRepository,
    ) { }

    async exec(_id: string, dto: UpdateProductPriceDTO) {
        const pipelineProductPrice = [{ $match: { _id } }]
        const document = await this.repository.selectOne(pipelineProductPrice)
        const pipelineProduct = [{ $match: { itemCode: document.itemCode, state: State.ACTIVO } }]
        await this.repository.selectOne<ProductENTITY>(pipelineProduct, collections.product)
        return this.repository.updateOne({ _id }, { $set: { ...dto, priceMax: Math.max(document.priceMax, dto.price) } })
    }

}