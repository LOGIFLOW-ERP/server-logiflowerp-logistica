import { Response, Request } from 'express'
import { inject, injectable } from 'inversify'
import { IProductMongoRepository } from '../Domain'
import { PRODUCT_TYPES } from '../Infrastructure/IoC'

@injectable()
export class UseCaseFind {

	constructor(
		@inject(PRODUCT_TYPES.MongoRepository) private readonly repository: IProductMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		const pipeline = req.body
		await this.repository.find(pipeline, req, res)
	}

}
