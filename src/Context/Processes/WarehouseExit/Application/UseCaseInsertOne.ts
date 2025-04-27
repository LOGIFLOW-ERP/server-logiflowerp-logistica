import { IWarehouseExitMongoRepository } from '../Domain';
import { AuthUserDTO, CreateWarehouseExitDTO, WarehouseExitENTITY, validateCustom } from 'logiflowerp-sdk';
import { UnprocessableEntityException } from '@Config/exception';
import { WAREHOUSE_EXIT_TYPES } from '../Infrastructure/IoC';
import { inject, injectable } from 'inversify';

@injectable()
export class UseCaseInsertOne {

    constructor(
        @inject(WAREHOUSE_EXIT_TYPES.RepositoryMongo) private readonly repository: IWarehouseExitMongoRepository,
    ) { }

    async exec(dto: CreateWarehouseExitDTO, user: AuthUserDTO) {
        const _entity = new WarehouseExitENTITY()
        _entity.set(dto)
        _entity.workflow.register.user = user
        _entity.workflow.register.date = new Date()
        const entity = await validateCustom(_entity, WarehouseExitENTITY, UnprocessableEntityException)
        return this.repository.insertOne(entity)
    }

}