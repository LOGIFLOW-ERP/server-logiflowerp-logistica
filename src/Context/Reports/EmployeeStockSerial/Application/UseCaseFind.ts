import { Response, Request } from 'express'
import { IEmployeeStockSerialMongoRepository } from '../Domain'
import { EMPLOYEE_STOCK_SERIAL_TYPES } from '../Infrastructure/IoC'
import { inject, injectable } from 'inversify'

@injectable()
export class UseCaseFind {

	constructor(
		@inject(EMPLOYEE_STOCK_SERIAL_TYPES.RepositoryMongo) private readonly repository: IEmployeeStockSerialMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		const pipeline = req.body
		await this.repository.find(pipeline, req, res)
	}

}
