import { inject, injectable } from 'inversify'
import { UNIT_OF_MEASURE_TYPES } from '../Infrastructure/IoC'
import { IUnitOfMeasureMongoRepository } from '../Domain'
import { UpdateUnitOfMeasureDTO } from 'logiflowerp-sdk'

@injectable()
export class UseCaseUpdateOne {

    constructor(
        @inject(UNIT_OF_MEASURE_TYPES.MongoRepository) private readonly repository: IUnitOfMeasureMongoRepository,
    ) { }

    async exec(_id: string, dto: UpdateUnitOfMeasureDTO) {
        return this.repository.updateOne({ _id }, { $set: dto })
    }

}