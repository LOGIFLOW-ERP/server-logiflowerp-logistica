import { IStoreMongoRepository } from '../Domain';
import { CreateStoreDTO, StoreENTITY, validateCustom } from 'logiflowerp-sdk';
import { UnprocessableEntityException } from '@Config/exception';
import { STORE_TYPES } from '../Infrastructure/IoC';
import { inject, injectable } from 'inversify';

@injectable()
export class UseCaseInsertOne {

    constructor(
        @inject(STORE_TYPES.RepositoryMongo) private readonly repository: IStoreMongoRepository,
    ) { }

    async exec(dto: CreateStoreDTO) {
        const _entity = new StoreENTITY()
        _entity.set(dto)
        _entity._id= crypto.randomUUID()
        const entity = await validateCustom(_entity, StoreENTITY, UnprocessableEntityException)
        return this.repository.insertOne(entity)
    }

}