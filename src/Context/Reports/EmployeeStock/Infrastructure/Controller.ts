import { Request, Response } from 'express'
import {
    BaseHttpController,
    httpGet,
    httpPost,
    request,
    response
} from 'inversify-express-utils'
import { authorizeRoute } from '@Shared/Infrastructure/Middlewares'
import {
    resolveCompanyFind,
    resolveCompanyGetDataLiquidationOrder,
    resolveCompanyReport,
    resolveCompanyReportIndividual,
} from './decorators'

export class EmployeeStockController extends BaseHttpController {

    @httpPost('find', authorizeRoute)
    @resolveCompanyFind
    async find(@request() req: Request, @response() res: Response) {
        await req.useCase.exec(req, res)
    }

    @httpPost('report', authorizeRoute)
    @resolveCompanyReport
    async report(@request() req: Request) {
        return await req.useCase.exec(req)
    }

    @httpGet('report-individual', authorizeRoute)
    @resolveCompanyReportIndividual
    async reportIndividual(@request() req: Request) {
        return await req.useCase.exec(req)
    }

    @httpGet('get-data-liquidation-order', authorizeRoute)
    @resolveCompanyGetDataLiquidationOrder
    async getDataLiquidationOrder(@request() req: Request) {
        return await req.useCase.exec(req)
    }
}