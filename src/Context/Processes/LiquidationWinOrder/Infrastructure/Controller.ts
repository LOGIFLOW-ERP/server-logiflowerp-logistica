import { Request, Response } from 'express'
import {
    BaseHttpController,
    httpGet,
    httpPost,
    httpPut,
    request,
    response
} from 'inversify-express-utils'
import {
    CreateInventoryDTO,
    validateRequestBody as VRB,
    validateUUIDv4Param as VUUID,
} from 'logiflowerp-sdk'
import { BadRequestException as BRE } from '@Config/exception'
import { authorizeRoute } from '@Shared/Infrastructure/Middlewares'
import {
    resolveCompanyAddInventory,
    resolveCompanyDeletePhotos,
    resolveCompanyGetAll,
    resolveCompanyUploadPhotos,
} from './decorators'
import multer from 'multer'
import { BodyReqDeletePhotoDTO } from '../Domain'

const upload = multer({ storage: multer.memoryStorage() })

export class LiquidationWinOrderController extends BaseHttpController {
    @httpGet('', authorizeRoute)
    @resolveCompanyGetAll
    private async findAll(@request() req: Request, @response() res: Response) {
        await req.useCase.exec(req, res)
    }

    @httpPut('add-inventory/:_id', authorizeRoute, VRB.bind(null, CreateInventoryDTO, BRE), VUUID.bind(null, BRE))
    @resolveCompanyAddInventory
    private addInventory(@request() req: Request) {
        return req.useCase.exec(req.params._id, req.body, req.user)
    }

    @httpPut('delete-photos/:_id', authorizeRoute, VRB.bind(null, BodyReqDeletePhotoDTO, BRE), VUUID.bind(null, BRE))
    @resolveCompanyDeletePhotos
    private deletePhotos(@request() req: Request) {
        return req.useCase.exec(req.params._id, req.body.key)
    }

    @httpPost(
        'upload-photos/:_id',
        authorizeRoute,
        VUUID.bind(null, BRE),
        upload.single('file')
    )
    @resolveCompanyUploadPhotos
    private uploadPhotos(@request() req: Request) {
        const idNodo = req.body.id
        return req.useCase.exec(req.params._id, req.file, req.user, req.tenant, idNodo)
    }
}