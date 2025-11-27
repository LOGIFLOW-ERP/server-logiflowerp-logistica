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
    resolveCompanyFindIndividual,
} from './decorators'

export class EmployeeStockSerialController extends BaseHttpController {

    @httpPost('find', authorizeRoute)
    @resolveCompanyFind
    async find(@request() req: Request, @response() res: Response) {
        await req.useCase.exec(req, res)
    }

    @httpPost('find-individual', authorizeRoute)
    @resolveCompanyFindIndividual
    private async findIndividual(@request() req: Request, @response() res: Response) {
        await req.useCase.exec(req, res)
    }
}