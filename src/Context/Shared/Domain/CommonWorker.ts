import { UnprocessableEntityException } from '@Config/exception'
import {
    AuthUserDTO,
    CreateNotificationDTO,
    PriorityNotification,
    TypeNotification,
    validateCustom
} from 'logiflowerp-sdk'

export class CommonWorker {
    protected queueNotification_UseCaseInsertOne = 'Notification_UseCaseInsertOne'

    protected createSuccesNotification(
        user: AuthUserDTO,
        titulo: string,
        mensaje: string,
        prioridad: PriorityNotification | undefined = PriorityNotification.MEDIAN,
        urlDestino: string | undefined = ''
    ) {
        const notification: CreateNotificationDTO = {
            titulo,
            mensaje,
            usuarioId: user._id,
            prioridad,
            tipo: TypeNotification.SUCCESS,
            urlDestino
        }
        return validateCustom(notification, CreateNotificationDTO, UnprocessableEntityException)
    }

    protected createInfoNotification(
        user: AuthUserDTO,
        titulo: string,
        mensaje: string,
        prioridad: PriorityNotification | undefined = PriorityNotification.MEDIAN,
        urlDestino: string | undefined = ''
    ) {
        const notification: CreateNotificationDTO = {
            titulo,
            mensaje,
            usuarioId: user._id,
            prioridad,
            tipo: TypeNotification.INFO,
            urlDestino
        }
        return validateCustom(notification, CreateNotificationDTO, UnprocessableEntityException)
    }

    protected createErrorNotification(
        user: AuthUserDTO,
        titulo: string,
        mensaje: string,
        prioridad: PriorityNotification | undefined = PriorityNotification.MEDIAN,
        urlDestino: string | undefined = ''
    ) {
        const notification: CreateNotificationDTO = {
            titulo,
            mensaje,
            usuarioId: user._id,
            prioridad,
            tipo: TypeNotification.ERROR,
            urlDestino
        }
        return validateCustom(notification, CreateNotificationDTO, UnprocessableEntityException)
    }
}