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
    CreateNotificationDTO,
    CreateWarehouseExitDetailDTO,
    CreateWarehouseExitDTO,
    EditAmountDetailDTO,
    getQueueName,
    getQueueNameSaveOneNotification,
    PriorityNotification,
    StockSerialDTO,
    TypeNotification,
    validateCustom,
    validateRequestBody as VRB,
    validateUUIDv4Param as VUUID,
} from 'logiflowerp-sdk'
import { BadRequestException as BRE, UnprocessableEntityException } from '@Config/exception'
import { authorizeRoute } from '@Shared/Infrastructure/Middlewares'
import {
    resolveCompanyAddDetail,
    resolveCompanyAddDetailBySerial,
    resolveCompanyAddSerial,
    resolveCompanyAutomaticReplenishmentToa,
    resolveCompanyAutomaticReplenishmentWin,
    resolveCompanyDeleteDetail,
    resolveCompanyDeleteOne,
    resolveCompanyDeleteSerial,
    resolveCompanyEditAmountDetail,
    resolveCompanyFind,
    resolveCompanyGetAll,
    resolveCompanyInsertOne,
    resolveCompanyValidate,
} from './decorators'
import { inject } from 'inversify'
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC'
import { AdapterRabbitMQ } from '@Shared/Infrastructure/Adapters'
import { CONFIG_TYPES } from '@Config/types'

export class WarehouseExitController extends BaseHttpController {
    constructor(
        @inject(SHARED_TYPES.AdapterRabbitMQ) private readonly adapterRabbitMQ: AdapterRabbitMQ,
        @inject(CONFIG_TYPES.Env) private readonly env: Env,
    ) {
        super()
    }

    @httpPost('find', authorizeRoute)
    @resolveCompanyFind
    private async find(@request() req: Request, @response() res: Response) {
        await req.useCase.exec(req, res)
    }

    @httpGet('', authorizeRoute)
    @resolveCompanyGetAll
    private async findAll(@request() req: Request, @response() res: Response) {
        await req.useCase.exec(req, res)
    }

    @httpPost('', authorizeRoute, VRB.bind(null, CreateWarehouseExitDTO, BRE))
    @resolveCompanyInsertOne
    private saveOne(@request() req: Request) {
        return req.useCase.exec(req.body, req.user)
    }

    @httpPost('bulk-exit', authorizeRoute)
    private async bulkExit(@request() req: Request, @response() res: Response) {
        const ticket = Date.now()
        await this.adapterRabbitMQ.publish({
            queue: getQueueName({ NODE_ENV: this.env.NODE_ENV, name: 'WarehouseExit_UseCaseBulkExit' }),
            message: { data: req.body, ticket },
            user: req.payloadToken
        })
        const notification: CreateNotificationDTO = {
            titulo: `Salida — Ticket N.º ${ticket}: Pedido creado`,
            mensaje: `Salida — Ticket N.º ${ticket}: Su pedido ha sido encolado. Puede usar este N° de ticket para hacer seguimiento de su pedido en las notificaciones. Pronto recibirá información sobre su estado.`,
            usuarioId: req.user._id,
            prioridad: PriorityNotification.MEDIAN,
            tipo: TypeNotification.INFO,
            urlDestino: '',
            invalidatesTags: []
        }
        const msg = await validateCustom(notification, CreateNotificationDTO, UnprocessableEntityException)
        await this.adapterRabbitMQ.publish({
            queue: getQueueNameSaveOneNotification({ NODE_ENV: this.env.NODE_ENV }),
            user: req.payloadToken,
            message: msg
        })
        res.sendStatus(204)
    }

    @httpPut('validate/:_id', authorizeRoute)
    @resolveCompanyValidate
    private validate(@request() req: Request) {
        return req.useCase.exec(req.params._id, req.user)
    }

    @httpPut('add-detail/:_id', authorizeRoute, VRB.bind(null, CreateWarehouseExitDetailDTO, BRE))
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

    @httpPut('edit-amount-detail/:_id', authorizeRoute, VRB.bind(null, EditAmountDetailDTO, BRE))
    @resolveCompanyEditAmountDetail
    private editAmountDetail(@request() req: Request) {
        return req.useCase.exec(req.params._id, req.query.keyDetail, req.body)
    }

    @httpPut('add-detail-by-serial/:_id', authorizeRoute, VRB.bind(null, StockSerialDTO, BRE))
    @resolveCompanyAddDetailBySerial
    private addDetailBySerial(@request() req: Request) {
        return req.useCase.exec(req.params._id, req.body)
    }
}