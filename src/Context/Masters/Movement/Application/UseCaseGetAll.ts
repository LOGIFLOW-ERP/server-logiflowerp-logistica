import { Response, Request } from 'express'
import { IMovementMongoRepository } from '../Domain'

export class UseCaseGetAll {

	constructor(
		private readonly repository: IMovementMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		await this.repository.find([], req, res)
	}

}
