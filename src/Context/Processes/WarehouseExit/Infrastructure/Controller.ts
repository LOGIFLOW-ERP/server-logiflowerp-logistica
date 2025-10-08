import { Request, Response } from 'express'
import {
    BaseHttpController,
    httpDelete,
    httpGet,
    httpPost,
    httpPut,
    request,
    response
} from 'inversify-express-utils'
import {
    CreateWarehouseExitDetailDTO,
    CreateWarehouseExitDTO,
    StockSerialDTO,
    validateRequestBody as VRB,
    validateUUIDv4Param as VUUID,
} from 'logiflowerp-sdk'
import { BadRequestException as BRE } from '@Config/exception'
import { authorizeRoute } from '@Shared/Infrastructure/Middlewares'
import {
    resolveCompanyAddDetail,
    resolveCompanyAddSerial,
    resolveCompanyAutomaticReplenishmentToa,
    resolveCompanyAutomaticReplenishmentWin,
    resolveCompanyDeleteDetail,
    resolveCompanyDeleteOne,
    resolveCompanyDeleteSerial,
    resolveCompanyFind,
    resolveCompanyGetAll,
    resolveCompanyInsertOne,
    resolveCompanyValidate,
} from './decorators'

export class WarehouseExitController extends BaseHttpController {

    @httpPost('find', authorizeRoute)
    @resolveCompanyFind
    async find(@request() req: Request, @response() res: Response) {
        await req.useCase.exec(req, res)
    }

    @httpGet('', authorizeRoute)
    @resolveCompanyGetAll
    async findAll(@request() req: Request, @response() res: Response) {
        await req.useCase.exec(req, res)
    }

    @httpPost('', authorizeRoute, VRB.bind(null, CreateWarehouseExitDTO, BRE))
    @resolveCompanyInsertOne
    saveOne(@request() req: Request) {
        return req.useCase.exec(req.body, req.user)
    }

    @httpPut('validate/:_id', authorizeRoute)
    @resolveCompanyValidate
    validate(@request() req: Request) {
        return req.useCase.exec(req.params._id, req.user)
    }

    @httpPut('add-detail/:_id', authorizeRoute, VRB.bind(null, CreateWarehouseExitDetailDTO, BRE))
    @resolveCompanyAddDetail
    addDetail(@request() req: Request) {
        return req.useCase.exec(req.params._id, req.body)
    }

    @httpPut('delete-detail/:_id', authorizeRoute)
    @resolveCompanyDeleteDetail
    deleteDetail(@request() req: Request) {
        return req.useCase.exec(req.params._id, req.query.keyDetail)
    }

    @httpPut('add-serial/:_id', authorizeRoute, VRB.bind(null, StockSerialDTO, BRE))
    @resolveCompanyAddSerial
    addSerial(@request() req: Request) {
        return req.useCase.exec(req.params._id, req.query.keyDetail, req.body)
    }

    @httpPut('delete-serial/:_id', authorizeRoute)
    @resolveCompanyDeleteSerial
    deleteSerial(@request() req: Request) {
        return req.useCase.exec(req.params._id, req.query)
    }

    @httpDelete(':_id', authorizeRoute, VUUID.bind(null, BRE))
    @resolveCompanyDeleteOne
    async deleteOne(@request() req: Request, @response() res: Response) {
        await req.useCase.exec(req.params._id)
        res.sendStatus(204)
    }

    @httpPost('automatic-replenishment-toa', authorizeRoute, VRB.bind(null, CreateWarehouseExitDTO, BRE))
    @resolveCompanyAutomaticReplenishmentToa
    private automaticReplenishmentToa(@request() req: Request) {
        return req.useCase.exec(req.body, req.user, req.tenant)
    }

    @httpPost('automatic-replenishment-win', authorizeRoute, VRB.bind(null, CreateWarehouseExitDTO, BRE))
    @resolveCompanyAutomaticReplenishmentWin
    private automaticReplenishmentWin(@request() req: Request) {
        return req.useCase.exec(req.body, req.user, req.tenant)
    }
}