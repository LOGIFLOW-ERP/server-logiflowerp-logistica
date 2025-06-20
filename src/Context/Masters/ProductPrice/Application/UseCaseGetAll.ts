import { Response, Request } from 'express'
import { IProductPriceMongoRepository } from '../Domain'
import { inject, injectable } from 'inversify'
import { PRODUCT_PRICE_TYPES } from '../Infrastructure/IoC'

@injectable()
export class UseCaseGetAll {

	constructor(
		@inject(PRODUCT_PRICE_TYPES.RepositoryMongo) private readonly repository: IProductPriceMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		await this.repository.find([{ $match: { isDeleted: false } }], req, res)
	}

}
