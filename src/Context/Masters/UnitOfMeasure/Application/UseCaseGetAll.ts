import { Response, Request } from 'express'
import { IUnitOfMeasureMongoRepository } from '../Domain'

export class UseCaseGetAll {

	constructor(
		private readonly repository: IUnitOfMeasureMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		await this.repository.find([], req, res)
	}

}
