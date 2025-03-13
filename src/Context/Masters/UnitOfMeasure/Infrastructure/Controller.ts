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
    CreateUnitOfMeasureDTO,
    UpdateUnitOfMeasureDTO,
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
import { UnitOfMeasureMongoRepository } from './MongoRepository'

export class UnitOfMeasureController extends BaseHttpController {

    @httpPost('find')
    async find(@request() req: Request, @response() res: Response) {
        const repository = new UnitOfMeasureMongoRepository(req.user.company.code)
        await new UseCaseFind(repository).exec(req, res)
    }

    @httpGet('')
    async findAll(@request() req: Request, @response() res: Response) {
        const repository = new UnitOfMeasureMongoRepository(req.user.company.code)
        await new UseCaseGetAll(repository).exec(req, res)
    }

    @httpPost('', VRB.bind(null, CreateUnitOfMeasureDTO, BRE))
    async saveOne(@request() req: Request, @response() res: Response) {
        const repository = new UnitOfMeasureMongoRepository(req.user.company.code)
        const newDoc = await new UseCaseInsertOne(repository).exec(req.body)
        res.status(201).json(newDoc)
    }

    @httpPut(':_id', VUUID.bind(null, BRE), VRB.bind(null, UpdateUnitOfMeasureDTO, BRE))
    async updateOne(@request() req: Request, @response() res: Response) {
        const repository = new UnitOfMeasureMongoRepository(req.user.company.code)
        const updatedDoc = await new UseCaseUpdateOne(repository).exec(req.params._id, req.body)
        res.status(200).json(updatedDoc)
    }

    @httpDelete(':_id', VUUID.bind(null, BRE))
    async deleteOne(@request() req: Request, @response() res: Response) {
        const repository = new UnitOfMeasureMongoRepository(req.user.company.code)
        const updatedDoc = await new UseCaseDeleteOne(repository).exec(req.params._id)
        res.status(200).json(updatedDoc)
    }

}