import { IProductMongoRepository } from '../Domain';
import {
    collections,
    CreateProductDTO,
    ProductENTITY,
    ProductGroupENTITY,
    UnitOfMeasureENTITY,
    validateCustom
} from 'logiflowerp-sdk';
import { UnprocessableEntityException } from '@Config/exception';
import { PRODUCT_TYPES } from '../Infrastructure/IoC';
import { inject, injectable } from 'inversify';

@injectable()
export class UseCaseInsertBulk {
    constructor(
        @inject(PRODUCT_TYPES.RepositoryMongo) private readonly repository: IProductMongoRepository,
    ) { }

    async exec(data: any[]) {
        const entities: ProductENTITY[] = []
        const dataProductGroup = await this.getDataProductGroup(data)
        const dataUM = await this.getDataUM(data)
        for (const [i, el] of data.entries()) {
            try {
                const _dto = {
                    itemCode: el['Codigo Material'],
                    itemName: el['Nombre Material'],
                    itmsGrpCod: el['Codigo Grupo'],
                    maxLevel: el['Max'],
                    minLevel: el['Min'],
                    producType: el['IND_SB'],
                    uomCode: el['UM'],
                }

                const dto = await validateCustom(_dto, CreateProductDTO, UnprocessableEntityException)

                if (!dataProductGroup.some(e => e.itmsGrpCod === dto.itmsGrpCod)) {
                    throw new Error(`No hay Grupo Producto con código ${dto.itmsGrpCod}`)
                }

                if (!dataUM.some(e => e.uomCode === dto.uomCode)) {
                    throw new Error(`No hay Unidad de Medida con código ${dto.itmsGrpCod}`)
                }

                const _entity = new ProductENTITY()
                _entity.set(dto)
                _entity._id = crypto.randomUUID()
                const entity = await validateCustom(_entity, ProductENTITY, UnprocessableEntityException)
                entities.push(entity)
            } catch (error) {
                const msg = `Error en el registro N° ${i + 1}, ${(error as Error).message}`
                throw new UnprocessableEntityException(msg, true)
            }
        }
        return this.repository.insertMany(entities)
    }

    private async getDataProductGroup(data: any[]) {
        const cods = data.map(e => e['Codigo Grupo'])
        const pipeline = [{ $match: { isDeleted: false, itmsGrpCod: { $in: cods } } }]
        return this.repository.select<ProductGroupENTITY>(pipeline, collections.productGroup)
    }

    private async getDataUM(data: any[]) {
        const cods = data.map(e => e['UM'])
        const pipeline = [{ $match: { isDeleted: false, uomCode: { $in: cods } } }]
        return this.repository.select<UnitOfMeasureENTITY>(pipeline, collections.unitOfMeasure)
    }
}