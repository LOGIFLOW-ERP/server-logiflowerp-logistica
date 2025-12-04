
import {
    AuthUserDTO,
    HistorialEstadosDTO,
    StateInternalOrderWin,
    StateOrderWin,
} from 'logiflowerp-sdk';
import {
    BadRequestException,
} from '@Config/exception';
import { inject, injectable } from 'inversify';
import { IWINOrderMongoRepository } from '@Processes/WinOrder/Domain';
import { WIN_ORDER_TYPES } from '@Processes/WinOrder/Infrastructure/IoC/types';

@injectable()
export class UseCaseSendReview {
    private estado_interno = StateInternalOrderWin.REVISION

    constructor(
        @inject(WIN_ORDER_TYPES.RepositoryMongo) private readonly repository: IWINOrderMongoRepository,
    ) { }

    async exec(_id: string, user: AuthUserDTO) {
        const document = await this.repository.selectOne([{ $match: { _id } }])
        if (document.estado !== StateOrderWin.FINALIZADA || document.estado_interno !== StateInternalOrderWin.PENDIENTE) {
            throw new BadRequestException(
                `No se puede enviar a revisión la orden, su estado es ${document.estado} y su estado interno es ${document.estado_interno}`,
                true
            )
        }

        const minPhotos = 4
        if (document.fotos.length < minPhotos) {
            throw new BadRequestException(
                `La orden debe tener al menos ${minPhotos} fotos antes de enviarse a revisión.`,
                true
            )
        }

        if (document.inventory.length === 0) {
            throw new BadRequestException(
                `La orden debe tener al menos 1 inventario antes de enviarse a revisión.`,
                true
            )
        }

        const historial: HistorialEstadosDTO = {
            estado: this.estado_interno,
            fecha: new Date(),
            observacion: '',
            usuario: `${user.names} ${user.surnames}`
        }

        return this.repository.updateOne(
            { _id },
            {
                $set: { estado_interno: this.estado_interno },
                $push: { historial_estados_interno: historial }
            }
        )
    }
}