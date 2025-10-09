import { IndexEntity } from '@Shared/Domain'
import { collection } from './Infrastructure/config'
import { Bootstraping } from '@Shared/Bootstraping'
import { RootCompanyENTITY, TOAOrderStockENTITY } from 'logiflowerp-sdk'
import { inject } from 'inversify'
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC'

export class ManagerEntity {

    private indexes: IndexEntity<TOAOrderStockENTITY>[] = [
        {
            campos: {
                resource_id: 1,
                itemCode: 1,
                serial: 1,
                numero_de_peticion: 1,
            },
            opciones: {
                name: 'idx_resource_id_itemCode_serial_numero_de_peticion',
                unique: true
            }
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