import { Response, Request } from 'express'
import { IMovementMongoRepository } from '../Domain'
import { inject, injectable } from 'inversify'
import { MOVEMENT_TYPES } from '../Infrastructure/IoC'

@injectable()
export class UseCaseGetAll {

	constructor(
		@inject(MOVEMENT_TYPES.RepositoryMongo) private readonly repository: IMovementMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		await this.repository.find([], req, res)
	}

}
