import { Request, Response } from 'express'
import {
    BaseHttpController,
    httpPost,
    request,
    response
} from 'inversify-express-utils'
import {
    resolveCompanyFind,
} from './decorators'
import { authorizeRoute } from '@Shared/Infrastructure/Middlewares'

export class CMSOrderController extends BaseHttpController {
    @httpPost('find', authorizeRoute)
    @resolveCompanyFind
    async find(@request() req: Request, @response() res: Response) {
        await req.useCase.exec(req, res)
    }
}