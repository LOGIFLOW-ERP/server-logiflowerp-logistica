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
    CreateWarehouseReturnDetailDTO,
    CreateWarehouseReturnDTO,
    StockSerialDTO,
    validateRequestBody as VRB,
    validateUUIDv4Param as VUUID,
} from 'logiflowerp-sdk'
import { BadRequestException as BRE } from '@Config/exception'
import { authorizeRoute } from '@Shared/Infrastructure/Middlewares'
import {
    resolveCompanyAddDetail,
    resolveCompanyAddSerial,
    resolveCompanyDeleteDetail,
    resolveCompanyDeleteOne,
    resolveCompanyDeleteSerial,
    resolveCompanyFind,
    resolveCompanyFindIndividual,
    resolveCompanyGetAll,
    resolveCompanyInsertOne,
    resolveCompanyInsertOneDraft,
    resolveCompanyRegister,
    resolveCompanyValidate,
} from './decorators'

export class WarehouseReturnController extends BaseHttpController {
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

    @httpGet('', authorizeRoute)
    @resolveCompanyGetAll
    private async findAll(@request() req: Request, @response() res: Response) {
        await req.useCase.exec(req, res)
    }

    @httpPost('', authorizeRoute, VRB.bind(null, CreateWarehouseReturnDTO, BRE))
    @resolveCompanyInsertOne
    private saveOne(@request() req: Request) {
        return req.useCase.exec(req.body, req.user)
    }

    @httpPost('create-draft-record', authorizeRoute, VRB.bind(null, CreateWarehouseReturnDTO, BRE))
    @resolveCompanyInsertOneDraft
    private saveOneDraft(@request() req: Request) {
        return req.useCase.exec(req.body, req.user)
    }

    @httpPut('register/:_id', authorizeRoute)
    @resolveCompanyRegister
    private register(@request() req: Request) {
        return req.useCase.exec(req.params._id)
    }

    @httpPut('validate/:_id', authorizeRoute)
    @resolveCompanyValidate
    private validate(@request() req: Request) {
        return req.useCase.exec(req.params._id, req.user)
    }

    @httpPut('add-detail/:_id', authorizeRoute, VRB.bind(null, CreateWarehouseReturnDetailDTO, BRE))
    @resolveCompanyAddDetail
    private addDetail(@request() req: Request) {
        return req.useCase.exec(req.params._id, req.body)
    }

    @httpPut('delete-detail/:_id', authorizeRoute)
    @resolveCompanyDeleteDetail
    private deleteDetail(@request() req: Request) {
        return req.useCase.exec(req.params._id, req.query.keyDetail)
    }

    @httpPut('add-serial/:_id', authorizeRoute, VRB.bind(null, StockSerialDTO, BRE))
    @resolveCompanyAddSerial
    private addSerial(@request() req: Request) {
        return req.useCase.exec(req.params._id, req.query.keyDetail, req.body)
    }

    @httpPut('delete-serial/:_id', authorizeRoute)
    @resolveCompanyDeleteSerial
    private deleteSerial(@request() req: Request) {
        return req.useCase.exec(req.params._id, req.query)
    }

    @httpDelete(':_id', authorizeRoute, VUUID.bind(null, BRE))
    @resolveCompanyDeleteOne
    private async deleteOne(@request() req: Request, @response() res: Response) {
        await req.useCase.exec(req.params._id)
        res.sendStatus(204)
    }
}