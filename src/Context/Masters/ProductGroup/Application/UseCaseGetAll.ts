import { Response, Request } from 'express'
import { IProductGroupMongoRepository } from '../Domain'

export class UseCaseGetAll {

	constructor(
		private readonly repository: IProductGroupMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		await this.repository.find([], req, res)
	}

}
