import { inject, injectable } from 'inversify'
import { IProductGroupMongoRepository } from '../Domain'
import { PRODUCT_GROUP_TYPES } from '../Infrastructure/IoC'

@injectable()
export class UseCaseDeleteOne {

    constructor(
        @inject(PRODUCT_GROUP_TYPES.RepositoryMongo) private readonly repository: IProductGroupMongoRepository,
    ) { }

    async exec(_id: string) {
        return this.repository.deleteOne({ _id })
    }

}