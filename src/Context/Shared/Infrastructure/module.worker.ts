import { inject, injectable } from 'inversify'
import { SHARED_TYPES } from './IoC/types';
import { AdapterRabbitMQ } from './Adapters';
import { initCollections } from '@Config/collections';
import { getExchangeNameInitializationCollections } from 'logiflowerp-sdk';
import { CONFIG_TYPES } from '@Config/types';

@injectable()
export class Worker {

    constructor(
        @inject(SHARED_TYPES.AdapterRabbitMQ) private readonly adapterRabbitMQ: AdapterRabbitMQ,
        @inject(CONFIG_TYPES.Env) private readonly env: Env,
    ) { }

    async exec() {
        await this.adapterRabbitMQ.subscribeFanout({
            exchange: getExchangeNameInitializationCollections({ NODE_ENV: this.env.NODE_ENV }),
            onMessage: async ({ message, user }) => {
                await initCollections(message)
                return 'Colecciones inicializadas'
            }
        })
    }
}