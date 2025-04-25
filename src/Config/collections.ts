import { MongoRepository } from '@Shared/Infrastructure/Repositories/Mongo'
import { Dirent, globSync } from 'fs'
import { collections, RootCompanyENTITY, State } from 'logiflowerp-sdk'
import path from 'path'
import { env } from './env'
import { ContainerGlobal } from './inversify'

async function getRootCompanies() {
    const repository = new MongoRepository<RootCompanyENTITY>(collections.company, env.DB_ROOT)
    const pipeline = [{ $match: { state: State.ACTIVO } }]
    return repository.select(pipeline)
}

async function initcollection(paths: Dirent[], rootCompanies: RootCompanyENTITY[]) {
    for (let rute of paths) {
        const newPath = path.join('../', `${rute.parentPath.split('src')[1]}/${rute.name}`)
        const { ManagerEntity } = await import(newPath)
        const instance = ContainerGlobal.resolve<any>(ManagerEntity)
        await instance.exec(rootCompanies)
    }
}

export const initCollections = async (rootCompanies?: RootCompanyENTITY[]) => {
    const cwd = path.resolve(__dirname, '../Context')
    const paths = globSync(['**/Bootstrap.js', '**/Bootstrap.ts'], { withFileTypes: true, cwd })
    const _rootCompanies = rootCompanies ? rootCompanies : await getRootCompanies()
    await initcollection(paths, _rootCompanies)
}