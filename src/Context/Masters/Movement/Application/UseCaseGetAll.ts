import { Response, Request } from 'express'
import { inject, injectable } from 'inversify'
import { IMovementMongoRepository } from '../Domain'
import { MOVEMENT_TYPES } from '../Infrastructure/IoC/types'

@injectable()
export class UseCaseGetAll {

	constructor(
		@inject(MOVEMENT_TYPES.MongoRepository) private readonly repository: IMovementMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		await this.repository.find([], req, res)
	}

}
