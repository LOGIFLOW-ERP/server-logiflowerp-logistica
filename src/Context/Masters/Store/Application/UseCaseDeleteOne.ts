import { inject, injectable } from 'inversify'
import { IStoreMongoRepository } from '../Domain'
import { STORE_TYPES } from '../Infrastructure/IoC'

@injectable()
export class UseCaseDeleteOne {

    constructor(
        @inject(STORE_TYPES.RepositoryMongo) private readonly repository: IStoreMongoRepository,
    ) { }

    async exec(_id: string) {
        return this.repository.deleteOne({ _id })
    }

}