import { Response, Request } from 'express'
import { IWarehouseExitMongoRepository } from '../Domain'
import { WAREHOUSE_EXIT_TYPES } from '../Infrastructure/IoC'
import { inject, injectable } from 'inversify'

@injectable()
export class UseCaseFind {

	constructor(
		@inject(WAREHOUSE_EXIT_TYPES.RepositoryMongo) private readonly repository: IWarehouseExitMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		const pipeline = req.body
		await this.repository.find(pipeline, req, res)
	}

}
