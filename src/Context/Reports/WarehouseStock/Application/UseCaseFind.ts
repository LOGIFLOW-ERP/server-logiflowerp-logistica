import { Response, Request } from 'express'
import { IWarehouseStockMongoRepository } from '../Domain'
import { WAREHOUSE_STOCK_TYPES } from '../Infrastructure/IoC'
import { inject, injectable } from 'inversify'

@injectable()
export class UseCaseFind {

	constructor(
		@inject(WAREHOUSE_STOCK_TYPES.RepositoryMongo) private readonly repository: IWarehouseStockMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		const pipeline = req.body
		await this.repository.find(pipeline, req, res)
	}

}
