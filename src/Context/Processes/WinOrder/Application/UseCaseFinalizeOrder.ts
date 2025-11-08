import { IWINOrderMongoRepository } from '../Domain'
import { inject, injectable } from 'inversify'
import { WIN_ORDER_TYPES } from '../Infrastructure/IoC/types'
import { collections, OrderStockENTITY, StateInternalOrderWin, StateInventory, validateCustom, WINOrderENTITY } from 'logiflowerp-sdk'
import { BadRequestException, UnprocessableEntityException } from '@Config/exception'

@injectable()
export class UseCaseFinalizeOrder {
	private transactions: ITransaction<any>[] = []

	constructor(
		@inject(WIN_ORDER_TYPES.RepositoryMongo) private readonly repository: IWINOrderMongoRepository,
	) { }

	async exec(_id: string) {
		const doc = await this.repository.selectOne([{ $match: { _id } }])
		if (doc.estado_interno !== StateInternalOrderWin.REVISION) {
			throw new BadRequestException(
				`Error al cambiar estado interno de la orden, su estado inerno es ${doc.estado_interno}`,
				true
			)
		}

		const toWinOrderStock: OrderStockENTITY[] = []

		for (const inv of doc.inventory) {
			const obj = {
				...inv,
				...doc,
				_id: crypto.randomUUID(),
				state_consumption: StateInventory.PENDIENTE,
				state_replacement: StateInventory.PENDIENTE,
				isDeleted: false,
				stock_quantity_employee: []
			} as any
			const entity = await validateCustom(obj, OrderStockENTITY, UnprocessableEntityException)
			toWinOrderStock.push(entity)
		}

		this.transactions.push({
			collection: collections.winOrderStock,
			transaction: 'insertMany',
			docs: toWinOrderStock
		})

		const transaction: ITransaction<WINOrderENTITY> = {
			transaction: 'updateOne',
			filter: { _id },
			update: {
				$set: {
					estado_interno: StateInternalOrderWin.FINALIZADA
				}
			}
		}
		this.transactions.push(transaction)
		
		return this.repository.executeTransactionBatch(this.transactions)
	}
}
