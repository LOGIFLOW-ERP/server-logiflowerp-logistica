import { inject, injectable } from 'inversify';
import { MOVEMENT_TYPES } from '../Infrastructure/IoC';
import { IMovementMongoRepository } from '../Domain';
import { MovementENTITY } from 'logiflowerp-sdk';

@injectable()
export class UseCaseInsertOne {

    constructor(
        @inject(MOVEMENT_TYPES.MongoRepository) private readonly repository: IMovementMongoRepository,
    ) { }

    async exec(dto: MovementENTITY) {
        return this.repository.insertOne(dto)
    }

}