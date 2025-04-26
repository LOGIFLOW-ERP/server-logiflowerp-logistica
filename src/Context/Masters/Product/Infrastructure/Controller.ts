import { Request, Response } from 'express'
import {
    BaseHttpController,
    httpPost,
    request,
    httpGet,
    httpPut,
    response
} from 'inversify-express-utils'
import {
    CreateProductDTO,
    UpdateProductDTO,
    validateRequestBody as VRB,
    validateUUIDv4Param as VUUID,
} from 'logiflowerp-sdk'
import {
    resolveCompanyFind,
    resolveCompanyGetAll,
    resolveCompanyInsertOne,
    resolveCompanyUpdateOne
} from './decorators'
import { authorizeRoute } from '@Shared/Infrastructure/Middlewares'
import { BadRequestException as BRE } from '@Config/exception'

export class ProductController extends BaseHttpController {

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

    @httpPost('', authorizeRoute, VRB.bind(null, CreateProductDTO, BRE))
    @resolveCompanyInsertOne
    async saveOne(@request() req: Request, @response() res: Response) {
        await req.useCase.exec(req.body)
        res.sendStatus(204)
    }

    @httpPut(':_id', authorizeRoute, VUUID.bind(null, BRE), VRB.bind(null, UpdateProductDTO, BRE))
    @resolveCompanyUpdateOne
    async updateOne(@request() req: Request, @response() res: Response) {
        await req.useCase.exec(req.params._id, req.body)
        res.sendStatus(204)
    }
}