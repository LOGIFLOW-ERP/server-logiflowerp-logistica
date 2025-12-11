import { inject, injectable } from 'inversify'
import {
	AuthUserDTO,
	collections,
	HistorialEstadosDTO,
	OrderStockENTITY,
	StateInternalOrderWin,
	StateInventory,
	validateCustom,
	WINOrderENTITY
} from 'logiflowerp-sdk'
import { BadRequestException, UnprocessableEntityException } from '@Config/exception'
import { IWINOrderMongoRepository } from '@Processes/WinOrder/Domain'
import { WIN_ORDER_TYPES } from '@Processes/WinOrder/Infrastructure/IoC/types'

@injectable()
export class UseCaseFinalizeOrder {
	private estado_interno = StateInternalOrderWin.FINALIZADA
	private transactions: ITransaction<any>[] = []

	constructor(
		@inject(WIN_ORDER_TYPES.RepositoryMongo) private readonly repository: IWINOrderMongoRepository,
	) { }

	async exec(_id: string, user: AuthUserDTO) {
		const doc = await this.repository.selectOne([{ $match: { _id } }])
		if (doc.estado_interno !== StateInternalOrderWin.PENDIENTE) {
			throw new BadRequestException(
				`Error al cambiar estado interno de la orden, su estado inerno es ${doc.estado_interno}`,
				true
			)
		}

		const minPhotos = 4
		if (doc.fotos.length < minPhotos) {
			throw new BadRequestException(
				`La orden debe tener al menos ${minPhotos} fotos antes de enviarse a revisión.`,
				true
			)
		}

		if (doc.inventory.length === 0) {
			throw new BadRequestException(
				`La orden debe tener al menos 1 inventario antes de enviarse a revisión.`,
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
				_id_stock: inv._id_stock,
			} as any
			const entity = await validateCustom(obj, OrderStockENTITY, UnprocessableEntityException)
			toWinOrderStock.push(entity)
		}

		this.transactions.push({
			collection: collections.winOrderStock,
			transaction: 'insertMany',
			docs: toWinOrderStock
		})

		const historial: HistorialEstadosDTO = {
			estado: this.estado_interno,
			fecha: new Date(),
			observacion: '',
			usuario: `${user.names} ${user.surnames}`
		}

		const transaction: ITransaction<WINOrderENTITY> = {
			transaction: 'updateOne',
			filter: { _id },
			update: {
				$set: { estado_interno: this.estado_interno },
				$push: { historial_estados_interno: historial }
			}
		}
		this.transactions.push(transaction)

		return this.repository.executeTransactionBatch(this.transactions)
	}
}
