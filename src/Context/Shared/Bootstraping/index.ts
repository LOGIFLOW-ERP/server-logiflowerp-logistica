import { IndexEntity } from '@Shared/Domain'
import { BootstrapingDatabaseMongo } from './database'

export class Bootstraping {

    databaseBootstrap: BootstrapingDatabaseMongo

    constructor(database: string, collection: string, indexes: IndexEntity[]) {
        this.databaseBootstrap = new BootstrapingDatabaseMongo(database, collection, indexes)
    }

    async exec() {
        await this.databaseBootstrap.exec()
    }

}