import { Response, Request } from 'express'
import { IStoreMongoRepository } from '../Domain'
import { inject, injectable } from 'inversify'
import { STORE_TYPES } from '../Infrastructure/IoC'

@injectable()
export class UseCaseGetAll {

	constructor(
		@inject(STORE_TYPES.RepositoryMongo) private readonly repository: IStoreMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		await this.repository.find([], req, res)
	}

}
