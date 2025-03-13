import { IStoreMongoRepository } from '../Domain'

export class UseCaseDeleteOne {

    constructor(
        private readonly repository: IStoreMongoRepository,
    ) { }

    async exec(_id: string) {
        return this.repository.deleteOne({ _id })
    }

}