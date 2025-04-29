import { Response, Request } from 'express'
import { IWarehouseStockSerialMongoRepository } from '../Domain'
import { WAREHOUSE_STOCK_SERIAL_TYPES } from '../Infrastructure/IoC'
import { inject, injectable } from 'inversify'

@injectable()
export class UseCaseFind {

	constructor(
		@inject(WAREHOUSE_STOCK_SERIAL_TYPES.RepositoryMongo) private readonly repository: IWarehouseStockSerialMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		const pipeline = req.body
		await this.repository.find(pipeline, req, res)
	}

}
