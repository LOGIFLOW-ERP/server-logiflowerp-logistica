import { Response, Request } from 'express'
import { IProductGroupMongoRepository } from '../Domain'

export class UseCaseFind {

	constructor(
		private readonly repository: IProductGroupMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		const pipeline = req.body
		await this.repository.find(pipeline, req, res)
	}

}
