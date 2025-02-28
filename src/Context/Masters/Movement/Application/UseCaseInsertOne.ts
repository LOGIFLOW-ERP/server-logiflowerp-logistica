import { inject, injectable } from 'inversify';
import { MOVEMENT_TYPES } from '../Infrastructure/IoC';
import { IMovementMongoRepository } from '../Domain';
import { CreateMovementDTO, MovementENTITY, validateCustom } from 'logiflowerp-sdk';
import { UnprocessableEntityException } from '@Config/exception';

@injectable()
export class UseCaseInsertOne {

    constructor(
        @inject(MOVEMENT_TYPES.MongoRepository) private readonly repository: IMovementMongoRepository,
    ) { }

    async exec(dto: CreateMovementDTO) {
        const _entity = new MovementENTITY()
        _entity.set(dto)
        const entity = await validateCustom(_entity, MovementENTITY, UnprocessableEntityException)
        return this.repository.insertOne(entity)
    }

}