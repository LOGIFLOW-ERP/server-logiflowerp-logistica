import { IWarehouseEntryMongoRepository } from '../Domain';
import { AuthUserDTO, CreateWarehouseEntryDTO, WarehouseEntryENTITY, validateCustom } from 'logiflowerp-sdk';
import { UnprocessableEntityException } from '@Config/exception';
import { WAREHOUSE_ENTRY_TYPES } from '../Infrastructure/IoC';
import { inject, injectable } from 'inversify';

@injectable()
export class UseCaseInsertOne {

    constructor(
        @inject(WAREHOUSE_ENTRY_TYPES.RepositoryMongo) private readonly repository: IWarehouseEntryMongoRepository,
    ) { }

    async exec(dto: CreateWarehouseEntryDTO, user: AuthUserDTO) {
        const _entity = new WarehouseEntryENTITY()
        _entity.set(dto)
        _entity.workflow.register.user = user
        _entity.workflow.register.date = new Date()
        const entity = await validateCustom(_entity, WarehouseEntryENTITY, UnprocessableEntityException)
        return this.repository.insertOne(entity)
    }

}