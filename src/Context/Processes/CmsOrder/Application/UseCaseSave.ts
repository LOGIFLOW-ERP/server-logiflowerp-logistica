import { ICMSOrderMongoRepository } from '../Domain'
import { inject, injectable } from 'inversify'
import { CMS_ORDER_TYPES } from '../Infrastructure/IoC/types'

@injectable()
export class UseCaseSave {
	constructor(
		@inject(CMS_ORDER_TYPES.RepositoryMongo) private readonly repository: ICMSOrderMongoRepository,
	) { }

	async exec(data: any[]) {

		// await this.repository.find(pipeline, req, res)
	}
}
