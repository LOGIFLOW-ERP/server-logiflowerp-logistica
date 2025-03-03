import { inject, injectable } from 'inversify'
import { STORE_TYPESENTITY } from '../Infrastructure/IoC'
import { IStoreMongoRepository } from '../Domain'
import { UpdateStoreDTO } from 'logiflowerp-sdk'

@injectable()
export class UseCaseUpdateOne {

    constructor(
        @inject(STORE_TYPESENTITY.MongoRepository) private readonly repository: IStoreMongoRepository,
    ) { }

    async exec(_id: string, dto: UpdateStoreDTO) {
        return this.repository.updateOne({ _id }, { $set: dto })
    }

}