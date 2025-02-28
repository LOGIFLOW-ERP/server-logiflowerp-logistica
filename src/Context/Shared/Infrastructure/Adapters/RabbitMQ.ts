import { inject, injectable } from 'inversify'
import { Channel, connect, Connection, ConsumeMessage } from 'amqplib'
import { env } from '@Config/env'
import { IParamsPublish, IParamsSubscribe } from '@Shared/Domain'
import { AdapterMail } from './Mail'
import { SHARED_TYPES } from '../IoC/types'
import { isJSON } from 'logiflowerp-sdk'

@injectable()
export class AdapterRabbitMQ {

    private connection!: Connection
    private channel!: Channel

    constructor(
        @inject(SHARED_TYPES.AdapterMail) private readonly adapterMail: AdapterMail,
    ) { }

    private async connect(url: string = env.RABBITMQ_URL) {
        try {
            if (!this.connection || !this.channel) {
                this.connection = await connect(url)
                this.channel = await this.connection.createChannel()
                this.channel.prefetch(1)
                console.log('\x1b[36m%s\x1b[0m', '>>> Conectado a RabbitMQ')
            }
        } catch (error) {
            console.error(error)
            process.exit(1)
        }
    }

    async publish(params: IParamsPublish) {
        const { queue, message, user } = params
        await this.channel.assertQueue(queue, { durable: true })
        const result = this.channel.sendToQueue(
            queue,
            Buffer.from(JSON.stringify(message)),
            {
                persistent: true,
                headers: { user }
            }
        )
        if (!result) {
            throw new Error(`Error al publicar en RabbitMQ (queue: ${queue})`)
        }
    }

    async subscribe(params: IParamsSubscribe) {
        await this.connect()
        const { queue } = params
        await this.channel.assertQueue(queue, { durable: true })
        this.channel.consume(queue, this.onMessage.bind(this, params))
    }

    private async onMessage(params: IParamsSubscribe, msg: ConsumeMessage | null) {
        const { onMessage, queue } = params
        try {
            if (!msg) {
                console.error('No hay mensaje')
                return
            }
            try {
                const message = msg
                    ? isJSON(msg.content.toString()) ? JSON.parse(msg.content.toString()) : msg
                    : null
                const user = msg && msg.properties.headers
                    ? msg.properties.headers.user
                    : null
                const result = await onMessage({ message, user })
            } catch (error) {
                console.error(error)
            }
            this.channel.ack(msg)
        } catch (error) {
            try {
                await this.adapterMail.send(
                    env.DEVELOPERS_MAILS,
                    `Error al ejecutar onMessage`,
                    undefined,
                    `Se produjo un error al ejecutar onMessage en queue ${queue}`
                )
            } catch (error) {
                console.error(error)
            }
        }
    }

}