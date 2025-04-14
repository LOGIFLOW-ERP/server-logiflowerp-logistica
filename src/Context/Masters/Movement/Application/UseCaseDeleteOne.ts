import { inject, injectable } from 'inversify'
import { IMovementMongoRepository } from '../Domain'
import { MOVEMENT_TYPES } from '../Infrastructure/IoC'

@injectable()
export class UseCaseDeleteOne {

    constructor(
        @inject(MOVEMENT_TYPES.RepositoryMongo) private readonly repository: IMovementMongoRepository,
    ) { }

    async exec(_id: string) {
        return this.repository.deleteOne({ _id })
    }

}