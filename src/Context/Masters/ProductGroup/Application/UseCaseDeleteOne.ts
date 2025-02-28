import { inject, injectable } from 'inversify'
import { PRODUCT_GROUP_TYPES } from '../Infrastructure/IoC'
import { IProductGroupMongoRepository } from '../Domain'
@injectable()
export class UseCaseDeleteOne {

    constructor(
        @inject(PRODUCT_GROUP_TYPES.MongoRepository) private readonly repository: IProductGroupMongoRepository,
    ) { }

    async exec(_id: string) {
        return this.repository.deleteOne({ _id })
    }

}