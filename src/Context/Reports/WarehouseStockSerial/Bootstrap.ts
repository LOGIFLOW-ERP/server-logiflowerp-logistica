import { IndexEntity } from '@Shared/Domain'
import { collection } from './Infrastructure/config'
import { Bootstraping } from '@Shared/Bootstraping'
import { RootCompanyENTITY, WarehouseStockSerialENTITY } from 'logiflowerp-sdk'
import { inject } from 'inversify'
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC'

export class ManagerEntity {

    private indexes: IndexEntity<WarehouseStockSerialENTITY>[] = [
        {
            campos: { keySearch: 1, keyDetail: 1, serial: 1 },
            opciones: { name: 'idx_keySearch_keyDetail_serial', unique: true }
        },
        {
            campos: { itemCode: 1 },
            opciones: { name: 'idx_itemCode' }
        },
    ]

    constructor(
        @inject(SHARED_TYPES.Bootstraping) private bootstrap: Bootstraping
    ) { }

    async exec(rootCompanies: RootCompanyENTITY[]) {
        for (const company of rootCompanies) {
            const db = company.code
            const col = collection

            console.info(`➽  Configurando ${col} en ${db} ...`)
            await this.bootstrap.exec(db, col, this.indexes)
            console.info(`➽  Configuración de ${col} en ${db} completada`)
        }
    }

}