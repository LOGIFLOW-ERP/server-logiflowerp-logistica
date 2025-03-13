import { IProductGroupMongoRepository } from '../Domain';
import { CreateProductGroupDTO, ProductGroupENTITY, validateCustom } from 'logiflowerp-sdk';
import { UnprocessableEntityException } from '@Config/exception';

export class UseCaseInsertOne {

    constructor(
        private readonly repository: IProductGroupMongoRepository,
    ) { }

    async exec(dto: CreateProductGroupDTO) {
        const _entity = new ProductGroupENTITY()
        _entity.set(dto)
        const entity = await validateCustom(_entity, ProductGroupENTITY, UnprocessableEntityException)
        return this.repository.insertOne(entity)
    }

}