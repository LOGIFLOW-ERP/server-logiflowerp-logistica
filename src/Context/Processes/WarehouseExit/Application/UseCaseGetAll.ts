import { Response, Request } from 'express'
import { IWarehouseExitMongoRepository } from '../Domain'
import { inject, injectable } from 'inversify'
import { WAREHOUSE_EXIT_TYPES } from '../Infrastructure/IoC'

@injectable()
export class UseCaseGetAll {

	constructor(
		@inject(WAREHOUSE_EXIT_TYPES.RepositoryMongo) private readonly repository: IWarehouseExitMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		await this.repository.find([{ $match: { isDeleted: false } }], req, res)
	}

}
