import { Response, Request } from 'express'
import { IEmployeeStockPexMongoRepository } from '../Domain'
import { EMPLOYEE_STOCKPEX_TYPES } from '../Infrastructure/IoC'
import { inject, injectable } from 'inversify'

@injectable()
export class UseCaseFind {

	constructor(
		@inject(EMPLOYEE_STOCKPEX_TYPES.RepositoryMongo) private readonly repository: IEmployeeStockPexMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		const pipeline = req.body
		await this.repository.find(pipeline, req, res)
	}

}
