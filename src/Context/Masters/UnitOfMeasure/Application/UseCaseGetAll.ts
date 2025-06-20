import { Response, Request } from 'express'
import { IUnitOfMeasureMongoRepository } from '../Domain'
import { inject, injectable } from 'inversify'
import { UNIT_OF_MEASURE_TYPES } from '../Infrastructure/IoC'

@injectable()
export class UseCaseGetAll {

	constructor(
		@inject(UNIT_OF_MEASURE_TYPES.RepositoryMongo) private readonly repository: IUnitOfMeasureMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		await this.repository.find([{ $match: { isDeleted: false } }], req, res)
	}

}
