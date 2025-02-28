import { inject, injectable } from 'inversify';
import { MOVEMENT_TYPES } from '../Infrastructure/IoC';
import { IMovementMongoRepository } from '../Domain';
import { CreateMovementDTO, MovementENTITY } from 'logiflowerp-sdk';

@injectable()
export class UseCaseInsertOne {

    constructor(
        @inject(MOVEMENT_TYPES.MongoRepository) private readonly repository: IMovementMongoRepository,
    ) { }

    async exec(dto: CreateMovementDTO) {
        const entity = new MovementENTITY()
        entity.set(dto)
        return this.repository.insertOne(entity)
    }

}