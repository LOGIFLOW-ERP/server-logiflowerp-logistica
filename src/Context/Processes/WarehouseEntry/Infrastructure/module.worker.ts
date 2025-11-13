import { inject, injectable } from 'inversify'
import { WAREHOUSE_ENTRY_TYPES } from './IoC/types';
import { UseCaseAddDetail, UseCaseAddDetailBulk, UseCaseAddSerial } from '../Application';
import { WarehouseEntryMongoRepository } from './MongoRepository';
import { collection } from './config';
import { createTenantScopedContainer, SHARED_TYPES } from '@Shared/Infrastructure/IoC';
import { AdapterRabbitMQ } from '@Shared/Infrastructure/Adapters';
import { CommonWorker } from '@Shared/Domain';

@injectable()
export class Worker extends CommonWorker {
    constructor(
        @inject(SHARED_TYPES.AdapterRabbitMQ) private readonly rabbitMQ: AdapterRabbitMQ,
    ) {
        super()
    }

    async exec() {
        await this.resolveCountryAddDetailBulk()
    }

    private async resolveCountryAddDetailBulk() {
        const queue = 'WarehouseEntry_UseCaseInsertOneBulk'
        await this.rabbitMQ.subscribe({
            queue,
            onMessage: async ({ message, user }) => {
                if (!user) {
                    throw new Error(`No se envió usuario`)
                }
                try {
                    const tenantContainer = createTenantScopedContainer(
                        WAREHOUSE_ENTRY_TYPES.UseCaseAddDetailBulk,
                        WAREHOUSE_ENTRY_TYPES.RepositoryMongo,
                        UseCaseAddDetailBulk,
                        WarehouseEntryMongoRepository,
                        user.rootCompany.code, // database
                        collection,
                        user.user,
                        [
                            [WAREHOUSE_ENTRY_TYPES.UseCaseAddDetail, UseCaseAddDetail],
                            [WAREHOUSE_ENTRY_TYPES.UseCaseAddSerial, UseCaseAddSerial],
                        ]
                    )
                    const useCase = tenantContainer.get<UseCaseAddDetailBulk>(WAREHOUSE_ENTRY_TYPES.UseCaseAddDetailBulk)
                    const doc = await useCase.exec(message._id, message.data)

                    const msg = await this.createSuccesNotification(
                        user.user,
                        `¡Detalles agregado ${doc.documentNumber}!`,
                        `Por favor refrescar datos y verificar. Se agregó los detalles al documento con Nro. Documento ${doc.documentNumber}.`
                    )
                    await this.rabbitMQ.publish({ queue: this.queueNotification_UseCaseInsertOne, user, message: msg })
                } catch (error) {
                    const mensaje = `Por favor refrescar datos y verificar. No se pudo agregar detalles (parcial o todo). ${(error as Error).message}`
                    console.error(mensaje)
                    const msg = await this.createSuccesNotification(user.user, `¡Error al agregar detalles!`, mensaje)
                    await this.rabbitMQ.publish({ queue: this.queueNotification_UseCaseInsertOne, user, message: msg })
                }
            }
        })
        console.log('\x1b[34m%s\x1b[0m', `>>> Suscrito a: ${queue}`)
    }
}