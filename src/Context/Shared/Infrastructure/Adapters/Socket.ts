import { inject, injectable } from 'inversify'
import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import { InternalServerException, UnauthorizedException } from '@Config/exception'
import { SHARED_TYPES } from '../IoC'
import { AdapterToken } from './Token'
import cookie from 'cookie'

@injectable()
export class AdapterSocket {

    private io!: Server

    constructor(
        @inject(SHARED_TYPES.AdapterToken) private readonly adapterToken: AdapterToken
    ) { }

    initialize(httpServer: HttpServer) {
        this.io = new Server(httpServer, {
            cors: {
                origin: "*",
                credentials: true
            }
        })

        console.log('\x1b[36m%s\x1b[0m', '>>> Servidor WebSocket iniciado correctamente')

        this.io.use(async (socket, next) => {
            try {
                // Leer cookie del header del handshake
                const cookiesHeader = socket.handshake.headers.cookie
                if (!cookiesHeader) throw new UnauthorizedException('No cookie header found')

                const cookies = cookie.parse(cookiesHeader)
                const token = cookies.authToken
                if (!token) throw new UnauthorizedException('No authToken provided')

                // Verificar token con tu adaptador
                const payload = await this.adapterToken.verify(token)
                if (!payload) throw new UnauthorizedException('Invalid or expired token')

                // Guarda info del usuario en socket.data
                socket.data.user = payload
                next()
            } catch (err:any) {
                console.error('❌ Socket auth error:', err)
                next(err)
            }
        })

        this.io.on('connection', (socket: Socket) => {
            console.log(`🟢 Cliente conectado: ${socket.id}`)

            // socket.on('message', (msg) => {
            //     console.log(`📩 Mensaje recibido: ${msg}`)
            //     this.io.emit('message', msg)
            // })

            socket.on('disconnect', () => {
                console.log(`🔴 Cliente desconectado: ${socket.id}`)
            })
        })
    }

    getIO() {
        if (!this.io) {
            throw new InternalServerException('Socket.IO no ha sido inicializado.')
        }
        return this.io
    }
}
