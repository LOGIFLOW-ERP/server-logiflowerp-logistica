import { Request, Response } from 'express'
import {
    BaseHttpController,
    httpPost,
    request,
    response
} from 'inversify-express-utils'
import {
    resolveCompanyFind,
    resolveCompanySave,
} from './decorators'
import { authorizeRoute } from '@Shared/Infrastructure/Middlewares'

export class CMSOrderController extends BaseHttpController {
    @httpPost('find', authorizeRoute)
    @resolveCompanyFind
    async find(@request() req: Request, @response() res: Response) {
        await req.useCase.exec(req, res)
    }

    @httpPost('upload-excel-orders', authorizeRoute)
    @resolveCompanySave
    saveOne(@request() req: Request) {
        return req.useCase.exec(req.body)
    }
}