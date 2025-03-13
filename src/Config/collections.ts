import { MongoRepository } from '@Shared/Infrastructure/Repositories/Mongo'
import { Dirent, globSync } from 'fs'
import { collections, prefix_col_root, State } from 'logiflowerp-sdk'
import path from 'path'

async function getRootCompanies() {
    const repository = new MongoRepository(`${prefix_col_root}_${collections.companies}`)
    const pipeline = [{ $match: { state: State.ACTIVO } }]
    return repository.select(pipeline)
}

async function initcollection(paths: Dirent[]) {
    const rootCompanies = await getRootCompanies()
    for (let rute of paths) {
        const newPath = path.join('../', `${rute.parentPath.split('src')[1]}/${rute.name}`)
        const { ManagerEntity } = await import(newPath)
        const app = new ManagerEntity()
        await app.exec(rootCompanies)
    }
}

export const initCollections = async () => {
    const cwd = path.resolve(__dirname, '../Context')
    const paths = globSync(['**/Bootstrap.js', '**/Bootstrap.ts'], { withFileTypes: true, cwd })
    await initcollection(paths)
}