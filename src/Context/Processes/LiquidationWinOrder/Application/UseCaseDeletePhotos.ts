import { IWINOrderMongoRepository } from '@Processes/WinOrder/Domain'
import { WIN_ORDER_TYPES } from '@Processes/WinOrder/Infrastructure/IoC/types'
import { AdapterS3FileStorage } from '@Shared/Infrastructure/Adapters'
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC'
import { inject, injectable } from 'inversify'

@injectable()
export class UseCaseDeletePhotos {
    constructor(
        @inject(SHARED_TYPES.AdapterS3FileStorage) private readonly fileStorage: AdapterS3FileStorage,
        @inject(WIN_ORDER_TYPES.RepositoryMongo) private readonly repository: IWINOrderMongoRepository,
    ) { }

    async exec(_id: string, key: string) {
        await this.fileStorage.delete(key)
        return this.repository.updateOne(
            { _id },
            { $pull: { fotos: { key } } }
        )
    }
}