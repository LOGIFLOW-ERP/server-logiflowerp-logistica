import { Response, Request } from 'express'
import { IProductGroupMongoRepository } from '../Domain'
import { inject, injectable } from 'inversify'
import { PRODUCT_GROUP_TYPES } from '../Infrastructure/IoC'

@injectable()
export class UseCaseFind {

	constructor(
		@inject(PRODUCT_GROUP_TYPES.RepositoryMongo) private readonly repository: IProductGroupMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		const pipeline = req.body
		await this.repository.find(pipeline, req, res)
	}

}
