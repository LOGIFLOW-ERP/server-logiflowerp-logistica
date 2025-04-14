import { IMovementMongoRepository } from '../Domain';
import { CreateMovementDTO, MovementENTITY, validateCustom } from 'logiflowerp-sdk';
import { UnprocessableEntityException } from '@Config/exception';
import { MOVEMENT_TYPES } from '../Infrastructure/IoC';
import { inject, injectable } from 'inversify';

@injectable()
export class UseCaseInsertOne {

    constructor(
        @inject(MOVEMENT_TYPES.RepositoryMongo) private readonly repository: IMovementMongoRepository,
    ) { }

    async exec(dto: CreateMovementDTO) {
        const _entity = new MovementENTITY()
        _entity.set(dto)
        const entity = await validateCustom(_entity, MovementENTITY, UnprocessableEntityException)
        return this.repository.insertOne(entity)
    }

}