import { Response, Request } from 'express'
import { inject, injectable } from 'inversify'
import { IStoreMongoRepository } from '../Domain'
import { STORE_TYPESENTITY } from '../Infrastructure/IoC'

@injectable()
export class UseCaseFind {

	constructor(
		@inject(STORE_TYPESENTITY.MongoRepository) private readonly repository: IStoreMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		const pipeline = req.body
		await this.repository.find(pipeline, req, res)
	}

}
