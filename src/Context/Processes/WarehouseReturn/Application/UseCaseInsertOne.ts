import { IWarehouseReturnMongoRepository } from '../Domain';
import { AuthUserDTO, CreateWarehouseReturnDTO, WarehouseReturnENTITY, validateCustom } from 'logiflowerp-sdk';
import { UnprocessableEntityException } from '@Config/exception';
import { WAREHOUSE_RETURN_TYPES } from '../Infrastructure/IoC';
import { inject, injectable } from 'inversify';

@injectable()
export class UseCaseInsertOne {

    constructor(
        @inject(WAREHOUSE_RETURN_TYPES.RepositoryMongo) private readonly repository: IWarehouseReturnMongoRepository,
    ) { }

    async exec(dto: CreateWarehouseReturnDTO, user: AuthUserDTO) {
        const _entity = new WarehouseReturnENTITY()
        _entity.set(dto)
        _entity.workflow.register.user = user
        _entity.workflow.register.date = new Date()
        const entity = await validateCustom(_entity, WarehouseReturnENTITY, UnprocessableEntityException)
        return this.repository.insertOne(entity)
    }

}