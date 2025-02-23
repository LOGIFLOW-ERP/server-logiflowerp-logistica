import { Application } from 'express'
import http from 'http'
import { ContainerGlobal } from './inversify'
import { AdapterSocket } from '@Shared/Infrastructure/Adapters'
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC'

export function initSocket(expressApp: Application) {

    const httpServer = http.createServer(expressApp)

    const socketService = ContainerGlobal.get<AdapterSocket>(SHARED_TYPES.AdapterSocket)
    socketService.initialize(httpServer)

    return httpServer
}