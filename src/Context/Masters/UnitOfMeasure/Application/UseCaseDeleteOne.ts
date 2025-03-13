import { IUnitOfMeasureMongoRepository } from '../Domain'

export class UseCaseDeleteOne {

    constructor(
        private readonly repository: IUnitOfMeasureMongoRepository,
    ) { }

    async exec(_id: string) {
        return this.repository.deleteOne({ _id })
    }

}