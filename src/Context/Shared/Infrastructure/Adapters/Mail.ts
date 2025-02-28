import { env } from '@Config/env'
import { injectable } from 'inversify'
import { createTransport, Transporter, } from 'nodemailer'

@injectable()
export class AdapterMail {

    private transporter: Transporter

    constructor() {
        this.transporter = this.createTransporter()
        // console.log(this.transporter)
    }

    private createTransporter() {
        return createTransport({
            host: env.SMTP_HOST,
            port: env.SMTP_PORT,
            secure: env.SMTP_SECURE,
            auth: {
                user: env.EMAIL_USER,
                pass: env.EMAIL_PASS
            }
        })
    }

    async send(
        recipients: string | string[],
        subject: string,
        plaintextMessage: string | Buffer<ArrayBufferLike> | undefined,
        HTMLMessage: string | Buffer<ArrayBufferLike> | undefined
    ) {
        try {
            const info = await this.transporter.sendMail({
                from: `"Logiflow ERP" <${env.EMAIL_USER}>`,
                to: recipients,
                subject,
                text: plaintextMessage,
                html: HTMLMessage
            })
            console.log('Message sent: %s', info.messageId)
        } catch (error) {
            console.error('Error al enviar el correo electrónico:', error)
            throw error
        }
    }

}