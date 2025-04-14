import { inject, injectable } from 'inversify'
import { IUnitOfMeasureMongoRepository } from '../Domain'
import { UNIT_OF_MEASURE_TYPES } from '../Infrastructure/IoC'

@injectable()
export class UseCaseDeleteOne {

    constructor(
        @inject(UNIT_OF_MEASURE_TYPES.RepositoryMongo) private readonly repository: IUnitOfMeasureMongoRepository,
    ) { }

    async exec(_id: string) {
        return this.repository.deleteOne({ _id })
    }

}