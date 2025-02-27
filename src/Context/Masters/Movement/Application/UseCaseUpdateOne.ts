import { inject, injectable } from 'inversify';
import { MOVEMENT_TYPES } from '../Infrastructure/IoC';
import { IMovementMongoRepository } from '../Domain';
import { MovementENTITY } from 'logiflowerp-sdk';

@injectable()
export class UseCaseUpdateOne {

    constructor(
        @inject(MOVEMENT_TYPES.MongoRepository) private readonly repository: IMovementMongoRepository,
    ) { }

    async exec(_id: string, dto: MovementENTITY) {
        const update: Partial<MovementENTITY> = { name: dto.name }
        return this.repository.updateOne({ _id }, { $set: update })
    }

}