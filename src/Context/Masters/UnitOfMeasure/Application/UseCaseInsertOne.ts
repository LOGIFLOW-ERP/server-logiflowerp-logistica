import { inject, injectable } from 'inversify';
import { UNIT_OF_MEASURE_TYPES } from '../Infrastructure/IoC';
import { IUnitOfMeasureMongoRepository } from '../Domain';
import { CreateUnitOfMeasureDTO, UnitOfMeasureENTITY, validateCustom } from 'logiflowerp-sdk';
import { UnprocessableEntityException } from '@Config/exception';

@injectable()
export class UseCaseInsertOne {

    constructor(
        @inject(UNIT_OF_MEASURE_TYPES.MongoRepository) private readonly repository: IUnitOfMeasureMongoRepository,
    ) { }

    async exec(dto: CreateUnitOfMeasureDTO) {
        const _entity = new UnitOfMeasureENTITY()
        _entity.set(dto)
        const entity = await validateCustom(_entity, UnitOfMeasureENTITY, UnprocessableEntityException)
        return this.repository.insertOne(entity)
    }

}