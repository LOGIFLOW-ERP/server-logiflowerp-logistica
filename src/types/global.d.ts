import * as Express from 'express'
import { AuthUserDTO, TokenPayloadDTO } from 'logiflowerp-sdk'

declare global {
    namespace Express {
        interface Request {
            payloadToken: TokenPayloadDTO
            user: AuthUserDTO
        }
    }
}