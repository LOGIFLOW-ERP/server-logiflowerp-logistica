import { inject, injectable } from 'inversify';
import { STORE_TYPESENTITY } from '../Infrastructure/IoC';
import { IStoreMongoRepository } from '../Domain';
import { CreateStoreDTO, StoreENTITY, validateCustom } from 'logiflowerp-sdk';
import { UnprocessableEntityException } from '@Config/exception';

@injectable()
export class UseCaseInsertOne {

    constructor(
        @inject(STORE_TYPESENTITY.MongoRepository) private readonly repository: IStoreMongoRepository,
    ) { }

    async exec(dto: CreateStoreDTO) {
        const _entity = new StoreENTITY()
        _entity.set(dto)
        const entity = await validateCustom(_entity, StoreENTITY, UnprocessableEntityException)
        return this.repository.insertOne(entity)
    }

}