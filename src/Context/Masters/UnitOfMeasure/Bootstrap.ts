import { IndexEntity } from '@Shared/Domain'
import { collection, database } from './Infrastructure/config'
import { Bootstraping } from '@Shared/Bootstraping'

export class ManagerEntity {

    private bootstrap: Bootstraping
    private database = database
    private collection = collection
    private indexes: IndexEntity[] = [
        {
            campos: [{ nombre: 'uomCode', direccion: 1 }],
            opciones: { name: 'idx_uomCode', unique: true }
        }
    ]

    constructor() {
        this.bootstrap = new Bootstraping(this.database, this.collection, this.indexes)
    }

    async exec() {
        console.info(`➽  Configurando ${this.collection} en ${this.database} ...`)
        await this.bootstrap.exec()
        console.info(`➽  Configuración de ${this.collection} en ${this.database} completada`)
    }

}