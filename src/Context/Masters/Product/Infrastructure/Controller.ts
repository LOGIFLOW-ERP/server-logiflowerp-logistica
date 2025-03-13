import { Request, Response } from 'express'
import { BadRequestException as BRE } from '@Config/exception'
import {
    BaseHttpController,
    httpPost,
    request,
    response
} from 'inversify-express-utils'
import { UseCaseFind } from '../Application'
import {
    UpdateUserDTO,
    UserENTITY,
    validateUUIDv4Param as VUUID,
    validateRequestBody as VRB
} from 'logiflowerp-sdk'
import { ProductMongoRepository } from './MongoRepository'

export class ProductController extends BaseHttpController {

    @httpPost('find')
    async find(@request() req: Request, @response() res: Response) {
        const repository = new ProductMongoRepository(req.user.company.code)
        await new UseCaseFind(repository).exec(req, res)
    }

    // @httpPost('update-one/:id', VUUID.bind(null, BRE), VRB.bind(null, UpdateUserDTO, BRE))
    // async updateOne(@request() req: Request<any, any, UserENTITY>, @response() res: Response) {
    //     console.log(req.originalUrl)
    //     // const updatedDoc = await this.useCaseUpdateOne.exec(req.params.id, req.body)
    //     // res.json(updatedDoc)
    // }

}