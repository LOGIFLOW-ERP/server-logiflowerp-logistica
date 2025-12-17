import { IWarehouseStockSerialMongoRepository } from '../Domain'
import { WAREHOUSE_STOCK_SERIAL_TYPES } from '../Infrastructure/IoC'
import { inject, injectable } from 'inversify'
import {
	collections,
	DataSerialTracking,
	EmployeeDTO,
	EmployeeStockENTITY,
	EmployeeStockSerialENTITY,
	MovementOrderDTO,
	ProductENTITY,
	ProductOrderDTO,
	SerialTrackingDTO,
	StoreDTO,
	WarehouseEntryENTITY,
	WarehouseExitENTITY,
	WarehouseReturnENTITY,
	WarehouseStockENTITY,
	WINOrderENTITY
} from 'logiflowerp-sdk'

@injectable()
export class UseCaseSerialTracking {
	private product: ProductENTITY | null = null

	constructor(
		@inject(WAREHOUSE_STOCK_SERIAL_TYPES.RepositoryMongo) private readonly repository: IWarehouseStockSerialMongoRepository,
	) { }

	async exec(data: SerialTrackingDTO[]) {
		const dataReturn: DataSerialTracking[] = []

		for (const { serial } of data) {
			const pipelineWEntry = [{ $match: { 'detail.serials.serial': serial } }]
			const wEntry = await this.repository.select<WarehouseEntryENTITY>(pipelineWEntry, collections.warehouseEntry)

			const pipelineWExit = [{ $match: { 'detail.serials.serial': serial } }]
			const wExit = await this.repository.select<WarehouseExitENTITY>(pipelineWExit, collections.warehouseExit)

			const pipelineWReturn = [{ $match: { 'detail.serials.serial': serial } }]
			const wReturn = await this.repository.select<WarehouseReturnENTITY>(pipelineWReturn, collections.warehouseReturn)

			const pipelineWSS = [{ $match: { serial } }]
			const wSS = await this.repository.select(pipelineWSS)

			const pipelineWS = [{
				$match: {
					keySearch: { $in: wSS.map(ws => ws.keySearch) },
					keyDetail: { $in: wSS.map(ws => ws.keyDetail) }
				}
			}]
			const wS = await this.repository.select<WarehouseStockENTITY>(pipelineWS, collections.warehouseStock)

			const pipelineESS = [{ $match: { serial } }]
			const eSS = await this.repository.select<EmployeeStockSerialENTITY>(pipelineESS, collections.employeeStockSerial)

			const pipelineES = [{
				$match: {
					keySearch: { $in: eSS.map(ws => ws.keySearch) },
					keyDetail: { $in: eSS.map(ws => ws.keyDetail) },
					'employee.identity': { $in: eSS.map(es => es.identity) }
				}
			}]
			const eS = await this.repository.select<EmployeeStockENTITY>(pipelineES, collections.employeeStock)

			const pipelineOrderWin = [{ $match: { 'inventory.invsn': serial } }]
			const orderWin = await this.repository.select<WINOrderENTITY>(pipelineOrderWin, collections.winOrder)

			const result: DataSerialTracking[] = []

			wEntry.forEach(entry => {
				entry.detail.forEach(detail => {
					detail.serials.forEach(s => {
						if (s.serial === serial) {
							result.push({
								_id: crypto.randomUUID(),
								documentNumber: entry.documentNumber,
								movement: entry.movement,
								store: entry.store,
								item: detail.item,
								serial: s.serial,
								stateSerial: '',
								stateDocument: entry.state,
								employee: new EmployeeDTO(),
								updatedate: Object.entries(entry.workflow).reduce((a, b) => a[1].date > b[1].date ? a : b)[1].date
							})
						}
					})
				})
			})

			wExit.forEach(row => {
				row.detail.forEach(detail => {
					detail.serials.forEach(s => {
						if (s.serial === serial) {
							result.push({
								_id: crypto.randomUUID(),
								documentNumber: row.documentNumber,
								movement: row.movement,
								store: row.store,
								item: detail.item,
								serial: s.serial,
								stateSerial: '',
								stateDocument: row.state,
								employee: row.carrier,
								updatedate: Object.entries(row.workflow).reduce((a, b) => a[1].date > b[1].date ? a : b)[1].date
							})
						}
					})
				})
			})

			wReturn.forEach(row => {
				row.detail.forEach(detail => {
					detail.serials.forEach(s => {
						if (s.serial === serial) {
							result.push({
								_id: crypto.randomUUID(),
								documentNumber: row.documentNumber,
								movement: row.movement,
								store: row.store,
								item: detail.item,
								serial: s.serial,
								stateSerial: '',
								stateDocument: row.state,
								employee: row.carrier,
								updatedate: Object.entries(row.workflow).reduce((a, b) => a[1].date > b[1].date ? a : b)[1].date
							})
						}
					})
				})
			})

			wSS.forEach(stockSerial => {
				const warehouseStock = wS.find(
					ws => ws.keySearch === stockSerial.keySearch &&
						ws.keyDetail === stockSerial.keyDetail
				)
				if (!warehouseStock) {
					throw new Error(`No se encontró el stock de almacén para la serie ${serial}`);
				}
				const movement = new MovementOrderDTO()
				movement.name = 'Stock almacén serie'
				result.push({
					_id: stockSerial._id,
					documentNumber: stockSerial.documentNumber,
					movement,
					store: warehouseStock.store,
					item: warehouseStock.item,
					serial: stockSerial.serial,
					stateSerial: stockSerial.state,
					stateDocument: '',
					employee: new EmployeeDTO(),
					updatedate: stockSerial.updatedate
				})
			})

			eSS.forEach(stockSerial => {
				const employeeStock = eS.find(
					es => es.keySearch === stockSerial.keySearch &&
						es.keyDetail === stockSerial.keyDetail &&
						es.employee.identity === stockSerial.identity
				)
				if (!employeeStock) {
					throw new Error(`No se encontró el stock de empleado para la serie ${serial}`);
				}
				const movement = new MovementOrderDTO()
				movement.name = 'Stock personal serie'
				result.push({
					_id: stockSerial._id,
					documentNumber: stockSerial.documentNumber,
					movement,
					store: employeeStock.store,
					item: employeeStock.item,
					serial: stockSerial.serial,
					stateSerial: stockSerial.state,
					stateDocument: '',
					employee: employeeStock.employee,
					updatedate: stockSerial.updatedate
				})
			})

			for (const doc of orderWin) {
				for (const inv of doc.inventory) {
					if (inv.invsn === serial) {
						const product = await this.getProduct(inv.code)
						const item = new ProductOrderDTO()
						item.itemCode = inv.code
						item.itemName = inv.description
						item.itmsGrpCod = product.itmsGrpCod
						item.producType = product.producType
						const employee = new EmployeeDTO()
						employee.identity = doc.resource_id
						const movement = new MovementOrderDTO()
						movement.name = 'Orden win'
						result.push({
							_id: crypto.randomUUID(),
							documentNumber: doc.numero_de_peticion,
							movement,
							store: new StoreDTO(),
							item,
							serial: inv.invsn,
							stateSerial: '',
							stateDocument: doc.estado_interno,
							employee,
							updatedate: doc.historial_estados_interno.reduce((latest, item) => { return item.fecha > latest.fecha ? item : latest }).fecha
						})
					}
				}
			}

			dataReturn.push(...result.sort((a, b) => a.updatedate.getTime() - b.updatedate.getTime()))
		}

		return dataReturn
	}

	private async getProduct(itemCode: string) {
		if (this.product) return this.product
		this.product = await this.repository.selectOne<ProductENTITY>([{ $match: { itemCode } }], collections.product)
		return this.product
	}
}
