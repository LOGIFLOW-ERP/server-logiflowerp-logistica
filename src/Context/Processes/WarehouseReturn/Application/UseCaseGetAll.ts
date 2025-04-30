import { Response, Request } from 'express'
import { IWarehouseReturnMongoRepository } from '../Domain'
import { inject, injectable } from 'inversify'
import { WAREHOUSE_RETURN_TYPES } from '../Infrastructure/IoC'

@injectable()
export class UseCaseGetAll {

	constructor(
		@inject(WAREHOUSE_RETURN_TYPES.RepositoryMongo) private readonly repository: IWarehouseReturnMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		await this.repository.find([], req, res)
	}

}
