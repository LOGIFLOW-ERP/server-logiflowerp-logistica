import { Response, Request } from 'express'
import { IStoreMongoRepository } from '../Domain'

export class UseCaseGetAll {

	constructor(
		private readonly repository: IStoreMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		await this.repository.find([], req, res)
	}

}
