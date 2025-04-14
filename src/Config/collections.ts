import { MongoRepository } from '@Shared/Infrastructure/Repositories/Mongo'
import { Dirent, globSync } from 'fs'
import { collections, State } from 'logiflowerp-sdk'
import path from 'path'
import { env } from './env'
import { ContainerGlobal } from './inversify'

async function getRootCompanies() {
    const repository = new MongoRepository(collections.companies, env.DB_ROOT)
    const pipeline = [{ $match: { state: State.ACTIVO } }]
    return repository.select(pipeline)
}

async function initcollection(paths: Dirent[]) {
    const rootCompanies = await getRootCompanies()
    for (let rute of paths) {
        const newPath = path.join('../', `${rute.parentPath.split('src')[1]}/${rute.name}`)
        const { ManagerEntity } = await import(newPath)
        const instance = ContainerGlobal.resolve<any>(ManagerEntity)
        await instance.exec(rootCompanies)
    }
}

export const initCollections = async () => {
    const cwd = path.resolve(__dirname, '../Context')
    const paths = globSync(['**/Bootstrap.js', '**/Bootstrap.ts'], { withFileTypes: true, cwd })
    await initcollection(paths)
}