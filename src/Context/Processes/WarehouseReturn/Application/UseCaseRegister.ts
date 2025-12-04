import { inject, injectable } from 'inversify';
import {
    StateOrder,
    WarehouseReturnENTITY,
    ProducType
} from 'logiflowerp-sdk';
import { WAREHOUSE_RETURN_TYPES } from '../Infrastructure/IoC';
import { IWarehouseReturnMongoRepository } from '../Domain';
import {
    BadRequestException,
} from '@Config/exception';

@injectable()
export class UseCaseRegister {

    private document!: WarehouseReturnENTITY

    constructor(
        @inject(WAREHOUSE_RETURN_TYPES.RepositoryMongo) private readonly repository: IWarehouseReturnMongoRepository,
    ) { }

    async exec(_id: string) {
        await this.searchDocument(_id)
        return this.repository.updateOne({ _id }, { $set: { state: StateOrder.REGISTRADO } })
    }

    private async searchDocument(_id: string) {
        const pipeline = [{ $match: { _id } }]
        this.document = await this.repository.selectOne(pipeline)
        if (this.document.state !== StateOrder.BORRADOR) {
            throw new BadRequestException(`El documento de devolución no se encuentra en estado ${StateOrder.BORRADOR}`, true)
        }
        if (this.document.detail.length === 0) {
            throw new BadRequestException('No se puede registrar un documento de devolución sin detalle', true)
        }
        if (this.document.detail.find(d => d.amount !== d.serials.length && d.item.producType === ProducType.SERIE)) {
            throw new BadRequestException('Hay items con cantidad de series diferente a la cantidad, complete o quite todas las series de los items', true)
        }
    }
}