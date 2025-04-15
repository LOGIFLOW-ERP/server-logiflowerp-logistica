import { Request, Response } from 'express'
import {
    BaseHttpController,
    httpPost,
    request,
    response
} from 'inversify-express-utils'
import { resolveCompanyFind } from './decorators'
import { authorizeRoute } from '@Shared/Infrastructure/Middlewares'

export class ProductController extends BaseHttpController {

    @httpPost('find', authorizeRoute)
    @resolveCompanyFind
    async find(@request() req: Request, @response() res: Response) {
        await req.useCase.exec(req, res)
    }

    // @httpPost('update-one/:id', VUUID.bind(null, BRE), VRB.bind(null, UpdateUserDTO, BRE))
    // async updateOne(@request() req: Request<any, any, UserENTITY>, @response() res: Response) {
    //     console.log(req.originalUrl)
    //     // const updatedDoc = await this.useCaseUpdateOne.exec(req.params.id, req.body)
    //     // res.json(updatedDoc)
    // }

}