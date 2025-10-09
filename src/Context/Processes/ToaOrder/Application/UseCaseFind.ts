import { Response, Request } from 'express'
import { ITOAOrderMongoRepository } from '../Domain'
import { inject, injectable } from 'inversify'
import { TOA_ORDER_TYPES } from '../Infrastructure/IoC/types'

@injectable()
export class UseCaseFind {
	constructor(
		@inject(TOA_ORDER_TYPES.RepositoryMongo) private readonly repository: ITOAOrderMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		const pipeline = req.body
		await this.repository.find(pipeline, req, res)
	}
}
