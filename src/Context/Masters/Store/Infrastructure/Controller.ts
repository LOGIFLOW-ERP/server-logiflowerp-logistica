import { inject } from 'inversify'
import { STORE_TYPESENTITY } from './IoC'
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
    CreateStoreDTO,
    UpdateStoreDTO,
    validateRequestBody as VRB,
    validateUUIDv4Param as VUUID,
} from 'logiflowerp-sdk'
import { BadRequestException as BRE } from '@Config/exception'
import {
    UseCaseDeleteOne,
    UseCaseFind,
    UseCaseGetAll,
    UseCaseInsertOne,
    UseCaseUpdateOne
} from '../Application'

export class StoreController extends BaseHttpController {

    constructor(
        @inject(STORE_TYPESENTITY.UseCaseFind) private readonly useCaseFind: UseCaseFind,
        @inject(STORE_TYPESENTITY.UseCaseGetAll) private readonly useCaseGetAll: UseCaseGetAll,
        @inject(STORE_TYPESENTITY.UseCaseInsertOne) private readonly useCaseInsertOne: UseCaseInsertOne,
        @inject(STORE_TYPESENTITY.UseCaseUpdateOne) private readonly useCaseUpdateOne: UseCaseUpdateOne,
        @inject(STORE_TYPESENTITY.UseCaseDeleteOne) private readonly useCaseDeleteOne: UseCaseDeleteOne,
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

    @httpPost('', VRB.bind(null, CreateStoreDTO, BRE))
    async saveOne(@request() req: Request, @response() res: Response) {
        const newDoc = await this.useCaseInsertOne.exec(req.body)
        res.status(201).json(newDoc)
    }

    @httpPut(':_id', VUUID.bind(null, BRE), VRB.bind(null, UpdateStoreDTO, BRE))
    async updateOne(@request() req: Request, @response() res: Response) {
        const updatedDoc = await this.useCaseUpdateOne.exec(req.params._id, req.body)
        res.status(200).json(updatedDoc)
    }

    @httpDelete(':_id', VUUID.bind(null, BRE))
    async deleteOne(@request() req: Request, @response() res: Response) {
        const updatedDoc = await this.useCaseDeleteOne.exec(req.params._id)
        res.status(200).json(updatedDoc)
    }

}