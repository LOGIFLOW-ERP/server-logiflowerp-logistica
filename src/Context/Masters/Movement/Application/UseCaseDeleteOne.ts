import { inject, injectable } from 'inversify'
import { MOVEMENT_TYPES } from '../Infrastructure/IoC'
import { IMovementMongoRepository } from '../Domain'
@injectable()
export class UseCaseDeleteOne {

    constructor(
        @inject(MOVEMENT_TYPES.MongoRepository) private readonly repository: IMovementMongoRepository,
    ) { }

    async exec(_id: string) {
        return this.repository.deleteOne({ _id })
    }

}