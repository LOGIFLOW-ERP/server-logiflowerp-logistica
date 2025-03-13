import { IUnitOfMeasureMongoRepository } from '../Domain';
import { CreateUnitOfMeasureDTO, UnitOfMeasureENTITY, validateCustom } from 'logiflowerp-sdk';
import { UnprocessableEntityException } from '@Config/exception';

export class UseCaseInsertOne {

    constructor(
        private readonly repository: IUnitOfMeasureMongoRepository,
    ) { }

    async exec(dto: CreateUnitOfMeasureDTO) {
        const _entity = new UnitOfMeasureENTITY()
        _entity.set(dto)
        const entity = await validateCustom(_entity, UnitOfMeasureENTITY, UnprocessableEntityException)
        return this.repository.insertOne(entity)
    }

}