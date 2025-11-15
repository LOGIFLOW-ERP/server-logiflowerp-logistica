import { inject, injectable } from 'inversify'
import { UseCaseAddDetail, UseCaseAddSerial, UseCaseBulkExit, UseCaseInsertOne } from '../Application';
import { collection } from './config';
import { createTenantScopedContainer, SHARED_TYPES } from '@Shared/Infrastructure/IoC';
import { AdapterRabbitMQ } from '@Shared/Infrastructure/Adapters';
import { BulkExit } from '../Domain';
import { WAREHOUSE_EXIT_TYPES } from './IoC';
import { WarehouseExitMongoRepository } from './MongoRepository';
import { getQueueName } from 'logiflowerp-sdk';
import { CONFIG_TYPES } from '@Config/types';

@injectable()
export class Worker extends BulkExit {
    constructor(
        @inject(SHARED_TYPES.AdapterRabbitMQ) private readonly rabbitMQ: AdapterRabbitMQ,
        @inject(CONFIG_TYPES.Env) private readonly env: Env,
    ) {
        super()
    }

    async exec() {
        await this.resolveCountryAddDetailBulk()
    }

    private async resolveCountryAddDetailBulk() {
        const queue = getQueueName({ NODE_ENV: this.env.NODE_ENV, name: 'WarehouseExit_UseCaseBulkExit' })
        await this.rabbitMQ.subscribe({
            queue,
            onMessage: async ({ message, user }) => {
                if (!user) {
                    throw new Error(`No se envió usuario`)
                }

                try {
                    const tenantContainer = createTenantScopedContainer(
                        WAREHOUSE_EXIT_TYPES.UseCaseBulkExit,
                        WAREHOUSE_EXIT_TYPES.RepositoryMongo,
                        UseCaseBulkExit,
                        WarehouseExitMongoRepository,
                        user.rootCompany.code, // database
                        collection,
                        user.user,
                        [
                            [WAREHOUSE_EXIT_TYPES.UseCaseAddDetail, UseCaseAddDetail],
                            [WAREHOUSE_EXIT_TYPES.UseCaseAddSerial, UseCaseAddSerial],
                            [WAREHOUSE_EXIT_TYPES.UseCaseInsertOne, UseCaseInsertOne],
                        ]
                    )
                    const useCase = tenantContainer.get<UseCaseBulkExit>(WAREHOUSE_EXIT_TYPES.UseCaseBulkExit)
                    await useCase.exec(message.data, user.user, message.ticket)

                    const msg = await this.createSuccesNotification(
                        user.user,
                        `Salida — Ticket N° ${message.ticket}: Proceso completado`,
                        `Salida — Ticket N° ${message.ticket}: Se procesó su pedido. todos los logs encontrados se enviaron a su correo ${user.user.email}.`,
                        this.invalidatesTags
                    )
                    await this.rabbitMQ.publish({ queue: this.queueNotification_UseCaseInsertOne, user, message: msg })
                } catch (error) {
                    const mensaje = `Salida — Ticket N° ${message.ticket}: Hubo un error as procesar su pedido. Error: ${(error as Error).message}`
                    console.error(mensaje)
                    const msg = await this.createErrorNotification(
                        user.user,
                        `Salida — Ticket N° ${message.ticket}: Error al procesar`,
                        mensaje,
                        this.invalidatesTags
                    )
                    await this.rabbitMQ.publish({ queue: this.queueNotification_UseCaseInsertOne, user, message: msg })
                }
            }
        })
        console.log('\x1b[34m%s\x1b[0m', `>>> Suscrito a: ${queue}`)
    }
}