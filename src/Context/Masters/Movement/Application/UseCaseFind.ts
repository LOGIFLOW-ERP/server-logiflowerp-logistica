import { Response, Request } from 'express'
import { inject, injectable } from 'inversify'
import { IMovementMongoRepository } from '../Domain'
import { MOVEMENT_TYPES } from '../Infrastructure/IoC'

@injectable()
export class UseCaseFind {

	constructor(
		@inject(MOVEMENT_TYPES.MongoRepository) private readonly repository: IMovementMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		const pipeline = req.body
		await this.repository.find(pipeline, req, res)
	}

}
