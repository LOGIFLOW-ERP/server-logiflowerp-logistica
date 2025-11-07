import { Response, Request } from 'express'
import { inject, injectable } from 'inversify'
import { collections, EmployeeENTITY, ScrapingSystem, State, StateInternalOrderWin, StateOrderWin } from 'logiflowerp-sdk'
import { ConflictException, NotFoundException } from '@Config/exception'
import { IWINOrderMongoRepository } from '@Processes/WinOrder/Domain'
import { WIN_ORDER_TYPES } from '@Processes/WinOrder/Infrastructure/IoC/types'

@injectable()
export class UseCaseGetAll {
	constructor(
		@inject(WIN_ORDER_TYPES.RepositoryMongo) private readonly repository: IWINOrderMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		const personel = await this.getPersonel(req)
		const resourceSystem = personel.resourceSystem.filter(e => e.system === ScrapingSystem.WIN)
		if (resourceSystem.length !== 1) {
			throw new Error(`Hay ${resourceSystem.length} resultados para recurso id: ${ScrapingSystem.WIN}`)
		}
		const pipeline = [{
			$match: {
				resource_id: resourceSystem[0].resource_id,
				estado: StateOrderWin.FINALIZADA,
				estado_interno: StateInternalOrderWin.PENDIENTE
			}
		}]
		await this.repository.find(pipeline, req, res)
	}

	private async getPersonel(req: Request) {
		const pipeline = [{ $match: { identity: req.user.identity, isDeleted: false, state: State.ACTIVO } }]
		const personel = await this.repository.select<EmployeeENTITY>(pipeline, collections.employee)
		if (personel.length === 0) {
			throw new NotFoundException('No se encontro el personal', true)
		}
		if (personel.length > 1) {
			throw new ConflictException('Se encontro mas de un personal', true)
		}
		return personel[0]
	}
}
