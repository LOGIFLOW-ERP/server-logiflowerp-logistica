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
    resolveCompanyFindWithAvailable,
    resolveCompanyReport,
} from './decorators'

export class WarehouseStockController extends BaseHttpController {
    @httpPost('find', authorizeRoute)
    @resolveCompanyFind
    async find(@request() req: Request, @response() res: Response) {
        await req.useCase.exec(req, res)
    }
    @httpPost('find-with-available', authorizeRoute)
    @resolveCompanyFindWithAvailable
    private async findWithAvailable(@request() req: Request, @response() res: Response) {
        return await req.useCase.exec(req.body)
    }

    @httpPost('report', authorizeRoute)
    @resolveCompanyReport
    async report(@request() req: Request) {
        return await req.useCase.exec(req)
    }

}