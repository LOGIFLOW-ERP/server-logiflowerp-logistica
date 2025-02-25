import { inject } from 'inversify'
import { MOVEMENT_TYPES } from './IoC'
import { Request, Response } from 'express'
import {
    BaseHttpController,
    httpGet,
    httpPost,
    request,
    response
} from 'inversify-express-utils'
import { UseCaseFind, UseCaseGetAll } from '../Application'

export class MovementController extends BaseHttpController {

    constructor(
        @inject(MOVEMENT_TYPES.UseCaseFind) private readonly useCaseFind: UseCaseFind,
        @inject(MOVEMENT_TYPES.UseCaseGetAll) private readonly useCaseGetAll: UseCaseGetAll,
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

}