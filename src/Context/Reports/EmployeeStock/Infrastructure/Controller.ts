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
    resolveCompanyFindIndividual,
    resolveCompanyGetDataLiquidationWinOrder,
    resolveCompanyReport,
    resolveCompanyReportIndividual,
} from './decorators'

export class EmployeeStockController extends BaseHttpController {

    @httpPost('find', authorizeRoute)
    @resolveCompanyFind
    private async find(@request() req: Request, @response() res: Response) {
        await req.useCase.exec(req, res)
    }

    @httpPost('find-individual', authorizeRoute)
    @resolveCompanyFindIndividual
    private async findIndividual(@request() req: Request, @response() res: Response) {
        await req.useCase.exec(req, res)
    }

    @httpPost('report', authorizeRoute)
    @resolveCompanyReport
    private async report(@request() req: Request) {
        return await req.useCase.exec(req.body)
    }

    @httpPost('report-individual', authorizeRoute)
    @resolveCompanyReportIndividual
    private async reportIndividual(@request() req: Request) {
        return await req.useCase.exec(req.body, req.user)
    }

    @httpGet('get-data-liquidation-win-order', authorizeRoute)
    @resolveCompanyGetDataLiquidationWinOrder
    private async getDataLiquidationWinOrder(@request() req: Request) {
        return await req.useCase.exec(req.user)
    }
}