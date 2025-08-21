import { NextFunction, Request } from 'express';
import { interfaces } from 'inversify';
import { createTenantScopedContainer } from '../IoC';
import { BadRequestException, UnprocessableEntityException } from '@Config/exception';
import { validateCustom } from 'logiflowerp-sdk';

export function resolveCompanyUseCasesDecorator(
    countryConfigs: CountryConfig,
    symbolRepositoryMongo: symbol,
    constructorMongoRepository: interfaces.Newable<unknown>,
    collection: string
) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (req: Request, res: Response, next: NextFunction) {

            const { country } = req.rootCompany
            const config = countryConfigs.get(country) ?? countryConfigs.get('DEFAULT')
            if (!config) {
                throw new BadRequestException(`No se encontró configuración para el país ${country}`)
            }

            const { dto, symbolUseCase, constructorUseCase } = config
            req.body = await validateCustom(req.body, dto, UnprocessableEntityException)

            const tenantContainer = createTenantScopedContainer(
                symbolUseCase,
                symbolRepositoryMongo,
                constructorUseCase,
                constructorMongoRepository,
                req.tenant, // database
                collection,
                req.user
            )
            const useCase = tenantContainer.get<typeof constructorUseCase>(symbolUseCase)
            req.useCase = useCase

            return originalMethod.apply(this, [req, res, next])

        }

        return descriptor
    }
}