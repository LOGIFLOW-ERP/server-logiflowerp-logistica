import { TokenPayloadDTO } from 'logiflowerp-sdk'

export interface IParamsSubscribe {
    queue: string
    onMessage: (params: IParamsOnMessage) => Promise<void>
}

export interface IParamsSubscribeFanout {
    exchange: string
    onMessage: (params: IParamsOnMessage) => Promise<void>
}

interface IParamsOnMessage {
    message: any
    user: TokenPayloadDTO | null
}