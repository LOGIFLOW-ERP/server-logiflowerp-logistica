import { inject, injectable } from 'inversify'
import { UNIT_OF_MEASURE_TYPES } from '../Infrastructure/IoC'
import { IUnitOfMeasureMongoRepository } from '../Domain'
@injectable()
export class UseCaseDeleteOne {

    constructor(
        @inject(UNIT_OF_MEASURE_TYPES.MongoRepository) private readonly repository: IUnitOfMeasureMongoRepository,
    ) { }

    async exec(_id: string) {
        return this.repository.deleteOne({ _id })
    }

}