import { typeEnv } from '@Config/env'
import * as Express from 'express'
import { AuthUserDTO, TokenPayloadDTO } from 'logiflowerp-sdk'
import { Document, Filter, OptionalUnlessRequiredId, UpdateFilter } from 'mongodb'

declare global {
    namespace Express {
        interface Request {
            payloadToken: TokenPayloadDTO
            user: AuthUserDTO
            userRoot: boolean
            rootCompany: CompanyUserDTO
            useCase: any
        }
    }
    interface ParamsPut {
        _id: string
    }
    interface ParamsDelete {
        _id: string
    }
    class ITransaction<T extends Document> {
        database?: string
        collection?: string
        transaction: keyof IMapTransaction
        doc?: OptionalUnlessRequiredId<T>
        filter?: Filter<T>
        update?: T[] | UpdateFilter<T>
    }
    type Env = typeEnv
}