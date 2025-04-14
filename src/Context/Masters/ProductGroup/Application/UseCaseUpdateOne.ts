import { inject, injectable } from 'inversify'
import { IProductGroupMongoRepository } from '../Domain'
import { UpdateProductGroupDTO } from 'logiflowerp-sdk'
import { PRODUCT_GROUP_TYPES } from '../Infrastructure/IoC'

@injectable()
export class UseCaseUpdateOne {

    constructor(
        @inject(PRODUCT_GROUP_TYPES.RepositoryMongo) private readonly repository: IProductGroupMongoRepository,
    ) { }

    async exec(_id: string, dto: UpdateProductGroupDTO) {
        return this.repository.updateOne({ _id }, { $set: dto })
    }

}