import { Request, Response } from 'express'
import {
    BaseHttpController,
    httpGet,
    httpPut,
    request,
    response
} from 'inversify-express-utils'
import {
    CreateInventoryDTO,
    validateRequestBody as VRB,
    validateUUIDv4Param as VUUID,
} from 'logiflowerp-sdk'
import { BadRequestException as BRE } from '@Config/exception'
import { authorizeRoute } from '@Shared/Infrastructure/Middlewares'
import {
    resolveCompanyAddInventory,
    resolveCompanyGetAll,
} from './decorators'

export class LiquidationOrderController extends BaseHttpController {
    @httpGet('', authorizeRoute)
    @resolveCompanyGetAll
    async findAll(@request() req: Request, @response() res: Response) {
        await req.useCase.exec(req, res)
    }

    @httpPut('add-inventory/:_id', authorizeRoute, VRB.bind(null, CreateInventoryDTO, BRE), VUUID.bind(null, BRE))
    @resolveCompanyAddInventory
    addInventory(@request() req: Request) {
        return req.useCase.exec(req.params._id, req.body)
    }
}