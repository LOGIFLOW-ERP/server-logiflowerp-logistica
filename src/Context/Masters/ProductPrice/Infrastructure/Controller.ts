import { inject } from 'inversify'
import { PRODUCT_PRICE_TYPES } from './IoC'
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
    CreateProductPriceDTO,
    UpdateProductPriceDTO,
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

export class ProductPriceController extends BaseHttpController {

    constructor(
        @inject(PRODUCT_PRICE_TYPES.UseCaseFind) private readonly useCaseFind: UseCaseFind,
        @inject(PRODUCT_PRICE_TYPES.UseCaseGetAll) private readonly useCaseGetAll: UseCaseGetAll,
        @inject(PRODUCT_PRICE_TYPES.UseCaseInsertOne) private readonly useCaseInsertOne: UseCaseInsertOne,
        @inject(PRODUCT_PRICE_TYPES.UseCaseUpdateOne) private readonly useCaseUpdateOne: UseCaseUpdateOne,
        @inject(PRODUCT_PRICE_TYPES.UseCaseDeleteOne) private readonly useCaseDeleteOne: UseCaseDeleteOne,
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

    @httpPost('', VRB.bind(null, CreateProductPriceDTO, BRE))
    async saveOne(@request() req: Request, @response() res: Response) {
        const newDoc = await this.useCaseInsertOne.exec(req.body)
        res.status(201).json(newDoc)
    }

    @httpPut(':_id', VUUID.bind(null, BRE), VRB.bind(null, UpdateProductPriceDTO, BRE))
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