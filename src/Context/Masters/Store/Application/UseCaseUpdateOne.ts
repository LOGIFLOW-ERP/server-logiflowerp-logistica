import { inject, injectable } from 'inversify'
import { IStoreMongoRepository } from '../Domain'
import { UpdateStoreDTO } from 'logiflowerp-sdk'
import { STORE_TYPES } from '../Infrastructure/IoC'

@injectable()
export class UseCaseUpdateOne {

    constructor(
        @inject(STORE_TYPES.RepositoryMongo) private readonly repository: IStoreMongoRepository,
    ) { }

    async exec(_id: string, dto: UpdateStoreDTO) {
        return this.repository.updateOne({ _id }, { $set: dto })
    }

}