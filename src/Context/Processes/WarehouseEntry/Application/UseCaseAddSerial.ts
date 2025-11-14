import { IWarehouseEntryMongoRepository } from '../Domain';
import {
    StateOrder,
    StockSerialDTO,
    WarehouseEntryENTITY,
} from 'logiflowerp-sdk';
import { ConflictException, NotFoundException, TooManyRequestsException } from '@Config/exception';
import { WAREHOUSE_ENTRY_TYPES } from '../Infrastructure/IoC';
import { inject, injectable } from 'inversify';

@injectable()
export class UseCaseAddSerial {

    private document!: WarehouseEntryENTITY

    constructor(
        @inject(WAREHOUSE_ENTRY_TYPES.RepositoryMongo) private readonly repository: IWarehouseEntryMongoRepository,
    ) { }

    async exec(_id: string, keyDetail: string, dto: StockSerialDTO, document?: WarehouseEntryENTITY) {
        if (document) {
            this.document = document
        } else {
            await this.searchDocument(_id)
        }

        this.validateDetail(keyDetail, dto)
        return this.repository.updateOne(
            {
                _id,
                'detail.keyDetail': keyDetail
            },
            {
                $push: {
                    'detail.$.serials': dto
                }
            }
        )
    }

    private async searchDocument(_id: string) {
        const pipeline = [{ $match: { _id } }]
        this.document = await this.repository.selectOne(pipeline)
        if (this.document.state === StateOrder.PROCESANDO) {
            throw new TooManyRequestsException(
                `¡Se está procesando el detalle de este documento!`,
                true
            )
        }
        if (this.document.state !== StateOrder.REGISTRADO) {
            throw new ConflictException(
                `¡El estado de la orden para agregar serie debe ser ${StateOrder.REGISTRADO}!`,
                true
            )
        }
    }

    private validateDetail(keyDetail: string, dto: StockSerialDTO) {
        const detail = this.document.detail.find(item => item.keyDetail === keyDetail)
        if (!detail) {
            throw new NotFoundException(
                `Detalle no encontrado o ya eliminado, código producto: ${keyDetail}`,
                true)
        }
        if (detail.serials.length >= detail.amount) {
            throw new ConflictException(
                `Ya se ha alcanzado la cantidad máxima de series permitidas para este detalle, código producto: ${detail.item.itemCode}${detail.lot ? `, Lote: ${detail.lot}` : ''}`,
                true
            )
        }
        if (detail.serials.some(e => e.serial === dto.serial)) {
            throw new ConflictException(`El serial ${dto.serial} ya existe en el detalle.`, true)
        }
        if (this.document.detail.some(e => e.serials.some(e => e.serial === dto.serial))) {
            throw new ConflictException(`El serial ${dto.serial} ya existe en detalle del documento.`, true)
        }
    }

}