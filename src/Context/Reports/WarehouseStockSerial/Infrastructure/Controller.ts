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
    resolveCompanySerialTracking,
} from './decorators'
import {
    SerialTrackingDTO,
    validateRequestBody as VRB,
} from 'logiflowerp-sdk'
import { BadRequestException as BRE } from '@Config/exception'

export class WarehouseStockSerialController extends BaseHttpController {

    @httpPost('find', authorizeRoute)
    @resolveCompanyFind
    async find(@request() req: Request, @response() res: Response) {
        await req.useCase.exec(req, res)
    }

    @httpPost('serial-tracking', authorizeRoute, VRB.bind(null, SerialTrackingDTO, BRE))
    @resolveCompanySerialTracking
    private async serialTracking(@request() req: Request) {
        return await req.useCase.exec(req.body)
    }
}