import { IMovementMongoRepository } from '../Domain'

export class UseCaseDeleteOne {

    constructor(
        private readonly repository: IMovementMongoRepository,
    ) { }

    async exec(_id: string) {
        return this.repository.deleteOne({ _id })
    }

}