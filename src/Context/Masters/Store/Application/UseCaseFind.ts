import { Response, Request } from 'express'
import { IStoreMongoRepository } from '../Domain'

export class UseCaseFind {

	constructor(
		private readonly repository: IStoreMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		const pipeline = req.body
		await this.repository.find(pipeline, req, res)
	}

}
