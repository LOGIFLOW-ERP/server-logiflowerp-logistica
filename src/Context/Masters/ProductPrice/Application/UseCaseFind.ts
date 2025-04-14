import { Response, Request } from 'express'
import { IProductPriceMongoRepository } from '../Domain'
import { PRODUCT_PRICE_TYPES } from '../Infrastructure/IoC'
import { inject, injectable } from 'inversify'

@injectable()
export class UseCaseFind {

	constructor(
		@inject(PRODUCT_PRICE_TYPES.RepositoryMongo)	private readonly repository: IProductPriceMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		const pipeline = req.body
		await this.repository.find(pipeline, req, res)
	}

}
