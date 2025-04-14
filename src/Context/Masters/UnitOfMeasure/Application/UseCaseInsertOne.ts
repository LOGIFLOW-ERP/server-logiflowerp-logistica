import { IUnitOfMeasureMongoRepository } from '../Domain';
import { CreateUnitOfMeasureDTO, UnitOfMeasureENTITY, validateCustom } from 'logiflowerp-sdk';
import { UnprocessableEntityException } from '@Config/exception';
import { UNIT_OF_MEASURE_TYPES } from '../Infrastructure/IoC';
import { inject, injectable } from 'inversify';

@injectable()
export class UseCaseInsertOne {

    constructor(
        @inject(UNIT_OF_MEASURE_TYPES.RepositoryMongo) private readonly repository: IUnitOfMeasureMongoRepository,
    ) { }

    async exec(dto: CreateUnitOfMeasureDTO) {
        const _entity = new UnitOfMeasureENTITY()
        _entity.set(dto)
        const entity = await validateCustom(_entity, UnitOfMeasureENTITY, UnprocessableEntityException)
        return this.repository.insertOne(entity)
    }

}