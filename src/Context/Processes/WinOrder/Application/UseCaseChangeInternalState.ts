import { IWINOrderMongoRepository } from '../Domain'
import { inject, injectable } from 'inversify'
import { WIN_ORDER_TYPES } from '../Infrastructure/IoC/types'
import { StateInternalOrderWin } from 'logiflowerp-sdk'
import { BadRequestException } from '@Config/exception'

@injectable()
export class UseCaseChangeInternalState {
	constructor(
		@inject(WIN_ORDER_TYPES.RepositoryMongo) private readonly repository: IWINOrderMongoRepository,
	) { }

	async exec(_id: string) {
		const doc = await this.repository.selectOne([{ $match: { _id } }])
		if (doc.estado_interno !== StateInternalOrderWin.PENDIENTE) {
			throw new BadRequestException(
				`Error al cambiar estado interno de la orden, su estado inerno es ${doc.estado_interno}`,
				true
			)
		}
		return this.repository.updateOne(
			{ _id },
			{
				$set: {
					estado_interno: StateInternalOrderWin.REVISION
				}
			}
		)
	}
}
