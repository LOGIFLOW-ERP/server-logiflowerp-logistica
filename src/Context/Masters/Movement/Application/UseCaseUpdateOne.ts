import { inject, injectable } from 'inversify';
import { MOVEMENT_TYPES } from '../Infrastructure/IoC';
import { IMovementMongoRepository } from '../Domain';
import { UpdateMovementDTO } from 'logiflowerp-sdk';

@injectable()
export class UseCaseUpdateOne {

    constructor(
        @inject(MOVEMENT_TYPES.MongoRepository) private readonly repository: IMovementMongoRepository,
    ) { }

    async exec(_id: string, dto: UpdateMovementDTO) {
        return this.repository.updateOne({ _id }, { $set: dto })
    }

}