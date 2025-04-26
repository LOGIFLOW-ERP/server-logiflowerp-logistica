import { inject, injectable } from 'inversify'
import { IProductMongoRepository } from '../Domain'
import { UpdateProductDTO } from 'logiflowerp-sdk'
import { PRODUCT_TYPES } from '../Infrastructure/IoC'

@injectable()
export class UseCaseUpdateOne {

    constructor(
        @inject(PRODUCT_TYPES.RepositoryMongo) private readonly repository: IProductMongoRepository,
    ) { }

    async exec(_id: string, dto: UpdateProductDTO) {
        return this.repository.updateOne({ _id }, { $set: dto })
    }

}