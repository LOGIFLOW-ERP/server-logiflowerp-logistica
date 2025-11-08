import { IWINOrderMongoRepository } from '@Processes/WinOrder/Domain'
import { WIN_ORDER_TYPES } from '@Processes/WinOrder/Infrastructure/IoC/types'
import { AdapterS3FileStorage } from '@Shared/Infrastructure/Adapters'
import { SHARED_TYPES } from '@Shared/Infrastructure/IoC'
import { inject, injectable } from 'inversify'
import { AuthUserDTO, FileDTO } from 'logiflowerp-sdk'

@injectable()
export class UseCaseUploadPhotos {
    constructor(
        @inject(SHARED_TYPES.AdapterS3FileStorage) private readonly fileStorage: AdapterS3FileStorage,
        @inject(WIN_ORDER_TYPES.RepositoryMongo) private readonly repository: IWINOrderMongoRepository,
    ) { }

    async exec(_id: string, file: Express.Multer.File, user: AuthUserDTO, tenant: string, id_nodo: string) {
        let uploadedFile: { url: string; key: string } | null = null
        try {
            uploadedFile = await this.fileStorage.upload(file, { folder: tenant })

            const foto: FileDTO = {
                createdAt: new Date(),
                isPublic: true,
                key: uploadedFile.key,
                mimetype: file.mimetype,
                size: file.size,
                uploadedBy: user.identity,
                url: uploadedFile.url,
                id_nodo
            }

            return this.repository.updateOne({ _id }, { $push: { fotos: foto } })
        } catch (error) {
            if (uploadedFile?.key) {
                try {
                    await this.fileStorage.delete(uploadedFile.key)
                    console.warn('Archivo eliminado por rollback:', uploadedFile.key)
                } catch (rollbackError) {
                    console.error('Error al revertir upload:', rollbackError)
                }
            }
            throw error
        }
    }
}