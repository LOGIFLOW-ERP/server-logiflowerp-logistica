import { Response, Request } from 'express'
import { IWarehouseReturnMongoRepository } from '../Domain'
import { WAREHOUSE_RETURN_TYPES } from '../Infrastructure/IoC'
import { inject, injectable } from 'inversify'

@injectable()
export class UseCaseFindIndividual {

	constructor(
		@inject(WAREHOUSE_RETURN_TYPES.RepositoryMongo) private readonly repository: IWarehouseReturnMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		const pipeline = req.body
		await this.repository.find([...pipeline, { $match: { 'carrier.identity': req.user.identity } }], req, res)
	}
}
