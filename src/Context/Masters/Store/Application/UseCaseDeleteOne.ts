import { inject, injectable } from 'inversify'
import { STORE_TYPESENTITY } from '../Infrastructure/IoC'
import { IStoreMongoRepository } from '../Domain'
@injectable()
export class UseCaseDeleteOne {

    constructor(
        @inject(STORE_TYPESENTITY.MongoRepository) private readonly repository: IStoreMongoRepository,
    ) { }

    async exec(_id: string) {
        return this.repository.deleteOne({ _id })
    }

}