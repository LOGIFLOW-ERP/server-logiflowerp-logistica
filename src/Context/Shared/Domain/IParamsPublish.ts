import { TokenPayloadDTO } from 'logiflowerp-sdk'

export interface IParamsPublish {
    queue: string
    message: any
    user?: TokenPayloadDTO
}