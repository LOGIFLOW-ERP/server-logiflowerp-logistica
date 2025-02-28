import { inject, injectable } from 'inversify'
import { PRODUCT_GROUP_TYPES } from '../Infrastructure/IoC'
import { IProductGroupMongoRepository } from '../Domain'
import { UpdateProductGroupDTO } from 'logiflowerp-sdk'

@injectable()
export class UseCaseUpdateOne {

    constructor(
        @inject(PRODUCT_GROUP_TYPES.MongoRepository) private readonly repository: IProductGroupMongoRepository,
    ) { }

    async exec(_id: string, dto: UpdateProductGroupDTO) {
        return this.repository.updateOne({ _id }, { $set: dto })
    }

}