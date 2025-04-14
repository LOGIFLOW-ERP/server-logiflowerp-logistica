import { UnprocessableEntityException } from '@Config/exception'
import { CONFIG_TYPES } from '@Config/types'
import { inject, injectable } from 'inversify'
import JWT from 'jsonwebtoken'
import { TokenPayloadDTO, validateCustom } from 'logiflowerp-sdk'

@injectable()
export class AdapterToken {

    constructor(
        @inject(CONFIG_TYPES.Env) private readonly env: Env,
    ) { }

    async create(payload: TokenPayloadDTO, secretOrPrivateKey: string = this.env.JWT_KEY, expiresIn?: number) {
        const _payload = await validateCustom(payload, TokenPayloadDTO, UnprocessableEntityException)
        return JWT.sign(JSON.parse(JSON.stringify(_payload)), secretOrPrivateKey, expiresIn ? { expiresIn } : {})
    }

    async verify(token: string, secretOrPublicKey: string = this.env.JWT_KEY) {
        try {
            const res = JWT.verify(token, secretOrPublicKey) as TokenPayloadDTO
            return await validateCustom(res, TokenPayloadDTO, UnprocessableEntityException)
        } catch (error) {
            console.error(error)
            return null
        }
    }

}