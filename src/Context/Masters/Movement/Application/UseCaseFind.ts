import { Response, Request } from 'express'
import { IMovementMongoRepository } from '../Domain'
import { inject, injectable } from 'inversify'
import { MOVEMENT_TYPES } from '../Infrastructure/IoC'

@injectable()
export class UseCaseFind {

	constructor(
		@inject(MOVEMENT_TYPES.RepositoryMongo) private readonly repository: IMovementMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		const pipeline = req.body
		await this.repository.find(pipeline, req, res)
	}

}
