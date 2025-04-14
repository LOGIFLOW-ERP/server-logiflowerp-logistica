import { Response, Request } from 'express'
import { IUnitOfMeasureMongoRepository } from '../Domain'
import { UNIT_OF_MEASURE_TYPES } from '../Infrastructure/IoC'
import { inject, injectable } from 'inversify'

@injectable()
export class UseCaseFind {

	constructor(
		@inject(UNIT_OF_MEASURE_TYPES.RepositoryMongo) private readonly repository: IUnitOfMeasureMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		const pipeline = req.body
		await this.repository.find(pipeline, req, res)
	}

}
