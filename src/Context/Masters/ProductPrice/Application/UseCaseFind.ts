import { Response, Request } from 'express'
import { inject, injectable } from 'inversify'
import { IProductPriceMongoRepository } from '../Domain'
import { PRODUCT_PRICE_TYPES } from '../Infrastructure/IoC'

@injectable()
export class UseCaseFind {

	constructor(
		@inject(PRODUCT_PRICE_TYPES.MongoRepository) private readonly repository: IProductPriceMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		const pipeline = req.body
		await this.repository.find(pipeline, req, res)
	}

}
