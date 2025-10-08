import { Response, Request } from 'express'
import { inject, injectable } from 'inversify'
import { collections, EmployeeENTITY, ScrapingSystem, StateOrderWin } from 'logiflowerp-sdk'
import { ConflictException, NotFoundException } from '@Config/exception'
import { IWINOrderMongoRepository } from '@Processes/WinOrder/Domain'
import { WIN_ORDER_TYPES } from '@Processes/WinOrder/Infrastructure/IoC/types'
import { Common } from '../Domain'

@injectable()
export class UseCaseGetAll extends Common {
	constructor(
		@inject(WIN_ORDER_TYPES.RepositoryMongo) private readonly repository: IWINOrderMongoRepository,
	) {
		super()
	}

	async exec(req: Request, res: Response) {
		const personel = await this.getPersonel(req)
		const resource_id = personel.resourceSystem.filter(e => e.system === ScrapingSystem.WIN)
		if (resource_id.length !== 1) {
			throw new Error(`Hay ${resource_id.length} resultados para recurso id: ${ScrapingSystem.WIN}`)
		}
		const pipeline = [{
			$match: {
				resource_id: resource_id,
				estado_actividad: { $nin: this.estados }
			}
		}]
		await this.repository.find(pipeline, req, res)
	}

	private async getPersonel(req: Request) {
		const pipeline = [{ $match: { identity: req.user.identity } }]
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
