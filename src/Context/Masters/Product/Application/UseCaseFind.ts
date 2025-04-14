import { Response, Request } from 'express'
import { IProductMongoRepository } from '../Domain'
import { inject, injectable } from 'inversify'
import { PRODUCT_TYPES } from '../Infrastructure/IoC'

@injectable()
export class UseCaseFind {

	constructor(
		@inject(PRODUCT_TYPES.RepositoryMongo) private readonly repository: IProductMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		const pipeline = req.body
		await this.repository.find(pipeline, req, res)
	}

}
