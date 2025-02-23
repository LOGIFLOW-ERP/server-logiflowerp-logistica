import { env, UnprocessableEntityException } from '@Config'
import { injectable } from 'inversify'
import JWT from 'jsonwebtoken'
import { TokenPayloadDTO, validateCustom } from 'logiflowerp-sdk'

@injectable()
export class AdapterToken {

    async create(payload: TokenPayloadDTO, secretOrPrivateKey: string = env.JWT_KEY, expiresIn?: number) {
        const _payload = await validateCustom(payload, TokenPayloadDTO, UnprocessableEntityException)
        return JWT.sign(JSON.parse(JSON.stringify(_payload)), secretOrPrivateKey, expiresIn ? { expiresIn } : {})
    }

    async verify(token: string, secretOrPublicKey: string = env.JWT_KEY) {
        try {
            const res = JWT.verify(token, secretOrPublicKey) as TokenPayloadDTO
            return validateCustom(res, TokenPayloadDTO, UnprocessableEntityException)
        } catch (error) {
            return null
        }
    }

}