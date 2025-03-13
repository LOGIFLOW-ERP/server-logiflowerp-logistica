import { Response, Request } from 'express'
import { IProductPriceMongoRepository } from '../Domain'

export class UseCaseGetAll {

	constructor(
		private readonly repository: IProductPriceMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		await this.repository.find([], req, res)
	}

}
