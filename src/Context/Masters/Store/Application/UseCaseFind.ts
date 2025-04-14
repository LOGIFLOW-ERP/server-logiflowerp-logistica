import { Response, Request } from 'express'
import { IStoreMongoRepository } from '../Domain'
import { STORE_TYPES } from '../Infrastructure/IoC'
import { inject, injectable } from 'inversify'

@injectable()
export class UseCaseFind {

	constructor(
		@inject(STORE_TYPES.RepositoryMongo) private readonly repository: IStoreMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		const pipeline = req.body
		await this.repository.find(pipeline, req, res)
	}

}
