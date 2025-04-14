import { inject, injectable } from 'inversify'
import { IUnitOfMeasureMongoRepository } from '../Domain'
import { UpdateUnitOfMeasureDTO } from 'logiflowerp-sdk'
import { UNIT_OF_MEASURE_TYPES } from '../Infrastructure/IoC'

@injectable()
export class UseCaseUpdateOne {

    constructor(
        @inject(UNIT_OF_MEASURE_TYPES.RepositoryMongo) private readonly repository: IUnitOfMeasureMongoRepository,
    ) { }

    async exec(_id: string, dto: UpdateUnitOfMeasureDTO) {
        return this.repository.updateOne({ _id }, { $set: dto })
    }

}