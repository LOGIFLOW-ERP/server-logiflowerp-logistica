import { inject } from 'inversify'
import { MOVEMENT_TYPES } from './IoC'
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
    MovementENTITY,
    validateRequestBody as VRB,
    validateUUIDv4Param as VUUID,
} from 'logiflowerp-sdk'
import { BadRequestException as BRE } from '@Config'
import {
    UseCaseDeleteOne,
    UseCaseFind,
    UseCaseGetAll,
    UseCaseInsertOne,
    UseCaseUpdateOne
} from '../Application'

export class MovementController extends BaseHttpController {

    constructor(
        @inject(MOVEMENT_TYPES.UseCaseFind) private readonly useCaseFind: UseCaseFind,
        @inject(MOVEMENT_TYPES.UseCaseGetAll) private readonly useCaseGetAll: UseCaseGetAll,
        @inject(MOVEMENT_TYPES.UseCaseInsertOne) private readonly useCaseInsertOne: UseCaseInsertOne,
        @inject(MOVEMENT_TYPES.UseCaseUpdateOne) private readonly useCaseUpdateOne: UseCaseUpdateOne,
        @inject(MOVEMENT_TYPES.UseCaseDeleteOne) private readonly useCaseDeleteOne: UseCaseDeleteOne,
    ) {
        super()
    }

    @httpPost('find')
    async find(@request() req: Request, @response() res: Response) {
        await this.useCaseFind.exec(req, res)
    }

    @httpGet('')
    async findAll(@request() req: Request, @response() res: Response) {
        await this.useCaseGetAll.exec(req, res)
    }

    @httpPost('', VRB.bind(null, MovementENTITY, BRE))
    async saveOne(@request() req: Request, @response() res: Response) {
        const newDoc = await this.useCaseInsertOne.exec(req.body)
        res.status(201).json(newDoc)
    }

    @httpPut(':id', VUUID.bind(null, BRE), VRB.bind(null, MovementENTITY, BRE))
    async updateOne(@request() req: Request, @response() res: Response) {
        const updatedDoc = await this.useCaseUpdateOne.exec(req.params.id, req.body)
        res.status(200).json(updatedDoc)
    }

    @httpDelete(':id', VUUID.bind(null, BRE))
    async deleteOne(@request() req: Request, @response() res: Response) {
        const updatedDoc = await this.useCaseDeleteOne.exec(req.params.id)
        res.status(200).json(updatedDoc)
    }

}