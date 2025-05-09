import { Request, Response } from 'express'
import {
    BaseHttpController,
    httpPost,
    request,
    response
} from 'inversify-express-utils'
import { authorizeRoute } from '@Shared/Infrastructure/Middlewares'
import {
    resolveCompanyFind,
} from './decorators'

export class WarehouseStockController extends BaseHttpController {

    @httpPost('find', authorizeRoute)
    @resolveCompanyFind
    async find(@request() req: Request, @response() res: Response) {
        await req.useCase.exec(req, res)
    }

    @httpPost('report', authorizeRoute)
    @resolveCompanyFind
    async report(@request() req: Request, @response() res: Response) {
        await req.useCase.exec(req, res)
    }

}