import { ContainerGlobal } from '@Config'
import { IndexEntity } from '@Shared/Domain'
import { AdapterMongoDB } from '@Shared/Infrastructure/Adapters'
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC'
import { CreateIndexesOptions, IndexSpecification } from 'mongodb'

export class BootstrapingDatabaseMongo {

    // private uri: string
    private database: string
    private collection: string
    private indexes: { value: IndexSpecification, opt: CreateIndexesOptions }[]
    private adapterMongo: AdapterMongoDB

    constructor(/*_uri: string,*/ _database: string, _collection: string, indexes: IndexEntity[]) {
        // this.uri = _uri
        this.database = _database
        this.collection = _collection
        this.indexes = []
        this.generateIndexes(indexes)
        this.adapterMongo = ContainerGlobal.get(SHARED_TYPES.AdapterMongoDB)
    }

    async exec() {
        await this.createCollection()
        await this.createIndexes()
    }

    private async createCollection() {
        const client = await this.adapterMongo.connection()
        const db = client.db(this.database)
        const collections = await db.listCollections().toArray()
        if (!collections.some(col => col.name === this.collection)) {
            await db.createCollection(this.collection)
        }
        // await this.adapterMongo.closeConnection()
    }

    private async createIndexes() {
        const client = await this.adapterMongo.connection()
        const db = client.db(this.database)
        const col = db.collection(this.collection)
        const indexesExists = await col.listIndexes().toArray()
        for (const index of indexesExists) {
            if (index.name.includes('_id')) {
                continue
            }
            await col.dropIndex(index.name)
        }
        for (const row of this.indexes) {
            await col.createIndex(row.value, row.opt)
        }
        // await this.adapterMongo.closeConnection()
    }

    private generateIndexes(indexes: IndexEntity[]) {
        for (const row of indexes) {
            this.indexes.push({
                opt: row.opciones,
                value: row.campos.map(el => ({ [el.nombre]: el.direccion }))
            })
        }
    }

}