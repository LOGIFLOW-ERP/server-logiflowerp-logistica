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
    CreateOrderDetailDTO,
    CreateWarehouseEntryDTO,
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
    resolveCompanyGetAll,
    resolveCompanyInsertOne,
    resolveCompanyValidate,
} from './decorators'
import { inject } from 'inversify'
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC'
import { AdapterRabbitMQ } from '@Shared/Infrastructure/Adapters'

export class WarehouseEntryController extends BaseHttpController {
    constructor(
        @inject(SHARED_TYPES.AdapterRabbitMQ) private readonly adapterRabbitMQ: AdapterRabbitMQ,
    ) {
        super()
    }

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

    @httpPost('', authorizeRoute, VRB.bind(null, CreateWarehouseEntryDTO, BRE))
    @resolveCompanyInsertOne
    saveOne(@request() req: Request) {
        return req.useCase.exec(req.body, req.user)
    }

    @httpPut('validate/:_id', authorizeRoute)
    @resolveCompanyValidate
    validate(@request() req: Request) {
        return req.useCase.exec(req.params._id, req.user)
    }

    @httpPut('add-detail/:_id', authorizeRoute, VRB.bind(null, CreateOrderDetailDTO, BRE))
    @resolveCompanyAddDetail
    addDetail(@request() req: Request) {
        return req.useCase.exec(req.params._id, req.body)
    }

    @httpPut('add-detail-bulk/:_id', authorizeRoute)
    private async addDetailBulk(@request() req: Request, @response() res: Response) {
        await this.adapterRabbitMQ.publish({
            queue: 'WarehouseEntry_UseCaseInsertOneBulk',
            message: { _id: req.params._id, data: req.body },
            user: req.payloadToken
        })
        await new Promise(resolve => setTimeout(resolve, 1500))
        res.sendStatus(204)
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

}