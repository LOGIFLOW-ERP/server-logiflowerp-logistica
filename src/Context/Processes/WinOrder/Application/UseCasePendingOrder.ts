import { IWINOrderMongoRepository } from '../Domain'
import { inject, injectable } from 'inversify'
import { WIN_ORDER_TYPES } from '../Infrastructure/IoC/types'
import {
	AuthUserDTO,
	HistorialEstadosDTO,
	StateInternalOrderWin,
	WINOrderENTITY
} from 'logiflowerp-sdk'
import { BadRequestException } from '@Config/exception'

@injectable()
export class UseCasePendingOrder {
	private estado_interno = StateInternalOrderWin.PENDIENTE
	private transactions: ITransaction<any>[] = []

	constructor(
		@inject(WIN_ORDER_TYPES.RepositoryMongo) private readonly repository: IWINOrderMongoRepository,
	) { }

	async exec(_id: string, user: AuthUserDTO) {
		const doc = await this.repository.selectOne([{ $match: { _id } }])
		if (doc.estado_interno !== StateInternalOrderWin.REVISION) {
			throw new BadRequestException(
				`Error al cambiar estado interno de la orden, su estado interno es ${doc.estado_interno}`,
				true
			)
		}

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
