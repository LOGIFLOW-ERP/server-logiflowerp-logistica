import { Response, Request } from 'express'
import { IProductMongoRepository } from '../Domain'

export class UseCaseFind {

	constructor(
		private readonly repository: IProductMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		const pipeline = req.body
		await this.repository.find(pipeline, req, res)
	}

}
