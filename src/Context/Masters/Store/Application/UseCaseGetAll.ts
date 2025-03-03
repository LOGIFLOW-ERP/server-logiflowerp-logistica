import { Response, Request } from 'express'
import { inject, injectable } from 'inversify'
import { IStoreMongoRepository } from '../Domain'
import { STORE_TYPESENTITY } from '../Infrastructure/IoC'

@injectable()
export class UseCaseGetAll {

	constructor(
		@inject(STORE_TYPESENTITY.MongoRepository) private readonly repository: IStoreMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		await this.repository.find([], req, res)
	}

}
