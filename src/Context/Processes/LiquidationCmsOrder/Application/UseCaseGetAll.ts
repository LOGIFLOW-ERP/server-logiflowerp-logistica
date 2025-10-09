import { Response, Request } from 'express'
import { inject, injectable } from 'inversify'
import { TOA_ORDER_TYPES } from '@Processes/ToaOrder/Infrastructure/IoC/types'
import { ITOAOrderMongoRepository } from '@Processes/ToaOrder/Domain'
import { collections, EmployeeENTITY, ScrapingSystem } from 'logiflowerp-sdk'
import { ConflictException, NotFoundException } from '@Config/exception'

@injectable()
export class UseCaseGetAll {
	constructor(
		@inject(TOA_ORDER_TYPES.RepositoryMongo) private readonly repository: ITOAOrderMongoRepository,
	) { }

	async exec(req: Request, res: Response) {
		const personel = await this.getPersonel(req)
		const resource_id = personel.resourceSystem.filter(e => e.system === ScrapingSystem.TOA)
		if (resource_id.length !== 1) {
			throw new Error(`Hay ${resource_id.length} resultados para recurso id: ${ScrapingSystem.TOA}`)
		}
		const pipeline = [{
			$match: {
				toa_resource_id: resource_id,
				estado_actividad: { $ne: 'Completado' }
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
