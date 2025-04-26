import { Response, Request } from 'express'
import { IWarehouseEntryMongoRepository } from '../Domain'
import { inject, injectable } from 'inversify'
import { WAREHOUSE_ENTRY_TYPES } from '../Infrastructure/IoC'

@injectable()
export class UseCaseGetAll {

	constructor(
		@inject(WAREHOUSE_ENTRY_TYPES.RepositoryMongo) private readonly repository: IWarehouseEntryMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		await this.repository.find([], req, res)
	}

}
