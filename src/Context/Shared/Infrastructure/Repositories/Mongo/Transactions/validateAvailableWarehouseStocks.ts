import { BadRequestException } from '@Config/exception'
import { StateOrder, WarehouseStockENTITY } from 'logiflowerp-sdk'
import { Collection, Document } from 'mongodb'

interface Props {
    colWarehouseStock: Collection
    colWarehouseExit: Collection
    pipeline?: Document[]
    _ids?: string[]
}

export async function _validateAvailableWarehouseStocks(params: Props) {
    const { colWarehouseExit, colWarehouseStock, pipeline, _ids } = params

    if (!_ids && !pipeline) {
        throw new BadRequestException(`Debe enviar "_ids" o "pipeline"`)
    }

    const _pipeline = _ids ? [{ $match: { _id: { $in: _ids } } }] : pipeline
    const dataWarehouseStock = await colWarehouseStock.aggregate<WarehouseStockENTITY>(_pipeline).toArray()
    const keys = dataWarehouseStock.reduce((acc: { keysDetail: string[]; keysSearch: string[] }, el) => {
        acc.keysDetail.push(el.keyDetail)
        acc.keysSearch.push(el.keySearch)
        return acc
    }, { keysDetail: [], keysSearch: [] })

    const pipelineWarehouseExit = [
        {
            $match: {
                'detail.keySearch': { $in: keys.keysSearch },
                'detail.keyDetail': { $in: keys.keysDetail },
                state: { $ne: StateOrder.VALIDADO }
            }
        },
        {
            $unwind: '$detail'
        },
        {
            $match: {
                'detail.keySearch': { $in: keys.keysSearch },
                'detail.keyDetail': { $in: keys.keysDetail }
            }
        },
        {
            $group: {
                _id: { keySearch: '$detail.keySearch', keyDetail: '$detail.keyDetail' },
                totalTransit: { $sum: '$detail.amount' }
            }
        }
    ]

    const dataTransit = await colWarehouseExit.aggregate(pipelineWarehouseExit).toArray()

    const transitMap = new Map<string, number>()
    for (const item of dataTransit) {
        const key = `${item._id.keySearch}||${item._id.keyDetail}`
        transitMap.set(key, item.totalTransit)
    }

    return dataWarehouseStock.map(warehouseStock => {
        const { incomeAmount, amountReturned, ouputQuantity, keyDetail, keySearch } = warehouseStock
        const transit = transitMap.get(`${keySearch}||${keyDetail}`) ?? 0
        const available = incomeAmount + amountReturned - ouputQuantity - transit
        return {
            keySearch,
            keyDetail,
            available
        }
    })

}