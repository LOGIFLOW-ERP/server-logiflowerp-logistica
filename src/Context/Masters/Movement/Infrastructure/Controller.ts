import { Request, Response } from 'express'
import {
    BaseHttpController,
    httpDelete,
    httpGet,
    httpPost,
    request,
    response
} from 'inversify-express-utils'
import {
    CreateMovementDTO,
    validateRequestBody as VRB,
    validateUUIDv4Param as VUUID,
} from 'logiflowerp-sdk'
import { BadRequestException as BRE } from '@Config/exception'
import {
    UseCaseDeleteOne,
    UseCaseFind,
    UseCaseGetAll,
    UseCaseInsertOne,
} from '../Application'
import { MovementMongoRepository } from './MongoRepository'

export class MovementController extends BaseHttpController {

    @httpPost('find')
    async find(@request() req: Request, @response() res: Response) {
        const repository = new MovementMongoRepository(req.user.company.code)
        await new UseCaseFind(repository).exec(req, res)
    }

    @httpGet('')
    async findAll(@request() req: Request, @response() res: Response) {
        const repository = new MovementMongoRepository(req.user.company.code)
        await new UseCaseGetAll(repository).exec(req, res)
    }

    @httpPost('', VRB.bind(null, CreateMovementDTO, BRE))
    async saveOne(@request() req: Request, @response() res: Response) {
        const repository = new MovementMongoRepository(req.user.company.code)
        const newDoc = await new UseCaseInsertOne(repository).exec(req.body)
        res.status(201).json(newDoc)
    }

    @httpDelete(':_id', VUUID.bind(null, BRE))
    async deleteOne(@request() req: Request, @response() res: Response) {
        const repository = new MovementMongoRepository(req.user.company.code)
        const updatedDoc = await new UseCaseDeleteOne(repository).exec(req.params._id)
        res.status(200).json(updatedDoc)
    }

}