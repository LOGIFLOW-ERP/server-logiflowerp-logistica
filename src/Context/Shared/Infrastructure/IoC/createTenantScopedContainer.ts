import { ContainerGlobal } from '@Config/inversify';
import { interfaces } from 'inversify';

export function createTenantScopedContainer(
    symbolUseCase: symbol,
    symbolRepositoryMongo: symbol,
    constructorUseCase: interfaces.Newable<unknown>,
    constructorMongoRepository: interfaces.Newable<unknown>,
    database: string,
    collection: string
) {
    const childContainer = ContainerGlobal.createChild()
    childContainer.bind('database').toConstantValue(database)
    childContainer.bind('collection').toConstantValue(collection)
    childContainer.bind(symbolRepositoryMongo).to(constructorMongoRepository)
    childContainer.bind(symbolUseCase).to(constructorUseCase)
    return childContainer
}