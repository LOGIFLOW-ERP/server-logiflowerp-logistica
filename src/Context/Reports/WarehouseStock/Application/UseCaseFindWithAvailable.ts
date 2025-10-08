import { IWarehouseStockMongoRepository } from '../Domain'
import { WAREHOUSE_STOCK_TYPES } from '../Infrastructure/IoC'
import { inject, injectable } from 'inversify'
import { Document } from 'mongodb'

@injectable()
export class UseCaseFindWithAvailable {
	constructor(
		@inject(WAREHOUSE_STOCK_TYPES.RepositoryMongo) private readonly repository: IWarehouseStockMongoRepository,
	) { }

	async exec(pipeline: Document[]) {
		pipeline.push({ $match: { isDeleted: false } })
		const result = await this.repository.select(pipeline)
		const resultAvailable = await this.repository.validateAvailableWarehouseStocks({ _ids: result.map(r => r._id) })
		for (const doc of result) {
			const available = resultAvailable.find(s => s.keySearch === doc.keySearch && s.keyDetail === doc.keyDetail)
			if (!available) {
				throw new Error(`No available stock found for keySearch: ${doc.keySearch}, keyDetail: ${doc.keyDetail}`)
			}
			doc.available = available.available
		}
		return result
	}
}
