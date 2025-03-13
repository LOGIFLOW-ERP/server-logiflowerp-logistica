import { Response, Request } from 'express'
import { IProductPriceMongoRepository } from '../Domain'

export class UseCaseFind {

	constructor(
		private readonly repository: IProductPriceMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		const pipeline = req.body
		await this.repository.find(pipeline, req, res)
	}

}
