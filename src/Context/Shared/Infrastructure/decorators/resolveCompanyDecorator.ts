import { NextFunction, Request } from 'express';
import { interfaces } from 'inversify';
import { createTenantScopedContainer } from '../IoC';

export function resolveCompanyDecorator(
    symbolUseCase: symbol,
    constructorUseCase: interfaces.Newable<unknown>,
    symbolRepositoryMongo: symbol,
    constructorMongoRepository: interfaces.Newable<unknown>,
    collection: string,
    useCases?: [symbol, interfaces.Newable<unknown>][]
) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (req: Request, res: Response, next: NextFunction) {

            const tenantContainer = createTenantScopedContainer(
                symbolUseCase,
                symbolRepositoryMongo,
                constructorUseCase,
                constructorMongoRepository,
                req.tenant, // database
                collection,
                req.user,
                useCases
            )
            const useCase = tenantContainer.get<typeof constructorUseCase>(symbolUseCase)
            req.useCase = useCase

            return originalMethod.apply(this, [req, res, next])

        }

        return descriptor
    }
}