import { Response, Request } from 'express'
import { IEmployeeStockMongoRepository } from '../Domain'
import { EMPLOYEE_STOCK_TYPES } from '../Infrastructure/IoC'
import { inject, injectable } from 'inversify'

@injectable()
export class UseCaseFindIndividual {

	constructor(
		@inject(EMPLOYEE_STOCK_TYPES.RepositoryMongo) private readonly repository: IEmployeeStockMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		const pipeline = req.body
		await this.repository.find([...pipeline, { $match: { 'employee.identity': req.user.identity } }], req, res)
	}
}
