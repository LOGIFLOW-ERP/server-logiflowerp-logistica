import { Request, Response } from 'express'
import {
    BaseHttpController,
    httpPost,
    request,
    response,
} from 'inversify-express-utils'
import {
    resolveCompanyProduction,
    resolveCompanyProductionZones
} from './decorators'
import {
    BodyReqReportProductionWinDTO,
    validateRequestBody as VRB,
} from 'logiflowerp-sdk'
import { BadRequestException as BRE } from '@Config/exception'

import { authorizeRoute } from '@Shared/Infrastructure/Middlewares'

export class WINReportsController extends BaseHttpController {
    @httpPost('production', authorizeRoute, VRB.bind(null, BodyReqReportProductionWinDTO, BRE))
    @resolveCompanyProduction
    private async production(@request() req: Request, @response() res: Response) {
        await req.useCase.exec(req, res)
    }

    @httpPost('production-zones', authorizeRoute, VRB.bind(null, BodyReqReportProductionWinDTO, BRE))
    @resolveCompanyProductionZones
    private async productionZones(@request() req: Request, @response() res: Response) {
        await req.useCase.exec(req, res)
    }
}