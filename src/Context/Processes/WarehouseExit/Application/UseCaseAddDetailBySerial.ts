import { IWarehouseExitMongoRepository } from '../Domain';
import {
    collections,
    CreateWarehouseExitDetailDTO,
    EditAmountDetailDTO,
    State,
    StateOrder,
    StateStockSerialWarehouse,
    StockSerialDTO,
    validateCustom,
    WarehouseExitENTITY,
    WarehouseStockENTITY,
    WarehouseStockSerialENTITY,
} from 'logiflowerp-sdk';
import { WAREHOUSE_EXIT_TYPES } from '../Infrastructure/IoC';
import { inject, injectable } from 'inversify';
import { UseCaseAddDetail } from './UseCaseAddDetail';
import { UseCaseAddSerial } from './UseCaseAddSerial';
import { UnprocessableEntityException } from '@Config/exception';
import { UseCaseEditAmountDetail } from './UseCaseEditAmountDetail';

@injectable()
export class UseCaseAddDetailBySerial {
    private document!: WarehouseExitENTITY

    constructor(
        @inject(WAREHOUSE_EXIT_TYPES.RepositoryMongo) protected readonly repository: IWarehouseExitMongoRepository,
        @inject(WAREHOUSE_EXIT_TYPES.UseCaseAddDetail) private readonly useCaseAddDetail: UseCaseAddDetail,
        @inject(WAREHOUSE_EXIT_TYPES.UseCaseAddSerial) private readonly useCaseAddSerial: UseCaseAddSerial,
        @inject(WAREHOUSE_EXIT_TYPES.UseCaseEditAmountDetail) private readonly useCaseEditAmountDetail: UseCaseEditAmountDetail,
    ) { }

    async exec(_id: string, dto: StockSerialDTO) {
        await this.searchDocument(_id)

        const warehouseStockSerial = await this.getWarehouseStockSerial(dto)
        const warehouseStock = await this.getWarehouseStock(warehouseStockSerial)

        await this.checkDetail(warehouseStock)

        const _dto = await validateCustom(dto, StockSerialDTO, UnprocessableEntityException)
        return this.useCaseAddSerial.exec(this.document._id, warehouseStock.keyDetail, _dto)
    }

    private async searchDocument(_id: string) {
        const pipeline = [{ $match: { _id, state: { $ne: StateOrder.VALIDADO } } }]
        this.document = await this.repository.selectOne(pipeline)
    }

    private async getWarehouseStockSerial(dto: StockSerialDTO) {
        const pipeline = [
            {
                $match: {
                    serial: dto.serial,
                    // state: StateStockSerialWarehouse.DISPONIBLE,
                    isDeleted: false
                }
            }
        ]
        const res = await this.repository.selectOne<WarehouseStockSerialENTITY>(pipeline, collections.warehouseStockSerial)
        if (res.state !== StateStockSerialWarehouse.DISPONIBLE) {
            throw new UnprocessableEntityException('El stock serial no está disponible, su estado es ' + res.state, true)
        }
        return res
    }

    private getWarehouseStock(warehouseStockSerial: WarehouseStockSerialENTITY) {
        const pipeline = [
            {
                $match: {
                    stockType: this.document.movement.stockType,
                    'store.code': this.document.store.code,
                    keySearch: warehouseStockSerial.keySearch,
                    keyDetail: warehouseStockSerial.keyDetail,
                    isDeleted: false,
                    state: State.ACTIVO
                }
            }
        ]
        return this.repository.selectOne<WarehouseStockENTITY>(pipeline, collections.warehouseStock)
    }

    private async checkDetail(warehouseStock: WarehouseStockENTITY) {
        const detail = this.document.detail.find((detail) => detail.keyDetail === warehouseStock.keyDetail)
        if (detail) {
            const dto = new EditAmountDetailDTO()
            dto.amount = detail.amount + 1
            await this.useCaseEditAmountDetail.exec(this.document._id, detail.keyDetail, dto)
        } else {
            const _dto: CreateWarehouseExitDetailDTO = {
                amount: 1,
                warehouseStock
            }
            const dto = await validateCustom(_dto, CreateWarehouseExitDetailDTO, UnprocessableEntityException)
            await this.useCaseAddDetail.exec(this.document._id, dto)
        }
    }
}