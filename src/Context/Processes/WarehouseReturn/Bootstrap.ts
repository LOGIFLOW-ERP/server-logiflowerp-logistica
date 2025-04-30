import { IndexEntity } from '@Shared/Domain'
import { collection } from './Infrastructure/config'
import { Bootstraping } from '@Shared/Bootstraping'
import { RootCompanyENTITY, WarehouseReturnENTITY } from 'logiflowerp-sdk'
import { inject } from 'inversify'
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC'

export class ManagerEntity {

    private indexes: IndexEntity<WarehouseReturnENTITY>[] = [
        {
            campos: { documentNumber: 1 },
            opciones: { name: 'idx_documentNumber', unique: true }
        },
        {
            campos: { 'detail.keySearch': 1, 'detail.keyDetail': 1, state: 1 },
            opciones: { name: 'idx_detail.keySearch_detail.keyDetail_state' }
        }
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