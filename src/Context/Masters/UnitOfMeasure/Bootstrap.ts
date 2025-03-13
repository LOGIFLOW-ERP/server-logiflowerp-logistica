import { IndexEntity } from '@Shared/Domain'
import { collection, database } from './Infrastructure/config'
import { Bootstraping } from '@Shared/Bootstraping'
import { RootCompanyENTITY } from 'logiflowerp-sdk'

export class ManagerEntity {

    private indexes: IndexEntity[] = [
        {
            campos: [{ nombre: 'uomCode', direccion: 1 }],
            opciones: { name: 'idx_uomCode', unique: true }
        }
    ]

    async exec(rootCompanies: RootCompanyENTITY[]) {
        for (const company of rootCompanies) {
            const db = database
            const col = `${company.code}_${collection}`
            const bootstrap = new Bootstraping(db, col, this.indexes)
            console.info(`➽  Configurando ${col} en ${db} ...`)
            await bootstrap.exec()
            console.info(`➽  Configuración de ${col} en ${db} completada`)
        }
    }

}