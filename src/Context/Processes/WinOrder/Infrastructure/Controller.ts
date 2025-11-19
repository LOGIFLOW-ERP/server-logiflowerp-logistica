import { Request, Response } from 'express'
import {
    BaseHttpController,
    httpPost,
    httpPut,
    request,
    response
} from 'inversify-express-utils'
import {
    resolveCompanyFinalizeOrder,
    resolveCompanyFind,
} from './decorators'
import { authorizeRoute } from '@Shared/Infrastructure/Middlewares'

export class WINOrderController extends BaseHttpController {
    @httpPost('find', authorizeRoute)
    @resolveCompanyFind
    async find(@request() req: Request, @response() res: Response) {
        await req.useCase.exec(req, res)
    }

    @httpPut('finalize-order/:_id', authorizeRoute)
    @resolveCompanyFinalizeOrder
    private finalizeOrder(@request() req: Request) {
        return req.useCase.exec(req.params._id, req.user)
    }
}