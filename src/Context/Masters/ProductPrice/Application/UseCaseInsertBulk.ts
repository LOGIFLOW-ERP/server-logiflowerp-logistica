import { IProductPriceMongoRepository } from '../Domain';
import {
    collections,
    CreateProductPriceDTO,
    ProductPriceENTITY,
    validateCustom,
    ProductENTITY,
    State,
    currencies
} from 'logiflowerp-sdk';
import { UnprocessableEntityException } from '@Config/exception';
import { PRODUCT_PRICE_TYPES } from '../Infrastructure/IoC';
import { inject, injectable } from 'inversify';

@injectable()
export class UseCaseInsertBulk {
    constructor(
        @inject(PRODUCT_PRICE_TYPES.RepositoryMongo) private readonly repository: IProductPriceMongoRepository,
    ) { }

    async exec(data: any[]) {
        const entities: ProductPriceENTITY[] = []
        const dataProduct = await this.getDataProduct(data)
        for (const [i, el] of data.entries()) {
            try {
                const _dto = {
                    _id: crypto.randomUUID(),
                    itemCode: el['Codigo Material'],
                    price: el['Precio'],
                    currency: el['Moneda'],
                }

                const currency = currencies.find(e => e.code === _dto.currency)
                if (!currency) {
                    throw new Error(`No hay Moneda con código ${_dto.currency}`)
                }

                const dto = await validateCustom({ ..._dto, currency }, CreateProductPriceDTO, UnprocessableEntityException)

                if (!dataProduct.some(e => e.itemCode === dto.itemCode)) {
                    throw new Error(`No hay Producto con código ${dto.itemCode}`)
                }

                const _entity = new ProductPriceENTITY()
                _entity.set(dto)
                _entity.priceMax = _entity.price
                const entity = await validateCustom(_entity, ProductPriceENTITY, UnprocessableEntityException)
                entities.push(entity)
            } catch (error) {
                const msg = `Error en el registro N° ${i + 1}, ${(error as Error).message}`
                throw new UnprocessableEntityException(msg, true)
            }
        }
        return this.repository.insertMany(entities)
    }

    private async getDataProduct(data: any[]) {
        const cods = data.map(e => e['Codigo Material'].toString())
        const pipeline = [{ $match: { isDeleted: false, state: State.ACTIVO, itemCode: { $in: cods } } }]
        return this.repository.select<ProductENTITY>(pipeline, collections.product)
    }
}