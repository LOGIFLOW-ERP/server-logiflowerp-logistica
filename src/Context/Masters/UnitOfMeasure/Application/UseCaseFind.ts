import { Response, Request } from 'express'
import { IUnitOfMeasureMongoRepository } from '../Domain'
export class UseCaseFind {

	constructor(
		private readonly repository: IUnitOfMeasureMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		const pipeline = req.body
		await this.repository.find(pipeline, req, res)
	}

}
