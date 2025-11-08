import { Response, Request } from 'express'
import { ICMSOrderMongoRepository } from '../Domain'
import { inject, injectable } from 'inversify'
import { CMS_ORDER_TYPES } from '../Infrastructure/IoC/types'

@injectable()
export class UseCaseFind {
	constructor(
		@inject(CMS_ORDER_TYPES.RepositoryMongo) private readonly repository: ICMSOrderMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		const pipeline = req.body
		await this.repository.find(pipeline, req, res)
	}
}
