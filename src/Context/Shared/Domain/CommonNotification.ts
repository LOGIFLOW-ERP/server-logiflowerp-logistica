import { UnprocessableEntityException } from '@Config/exception'
import {
    AuthUserDTO,
    CreateNotificationDTO,
    InvalidatesTagsDTO,
    PriorityNotification,
    TypeNotification,
    validateCustom
} from 'logiflowerp-sdk'

export class CommonNotification {
    protected queueNotification_UseCaseInsertOne = 'Notification_UseCaseInsertOne'

    protected createSuccesNotification(
        user: AuthUserDTO,
        titulo: string,
        mensaje: string,
        invalidatesTags: InvalidatesTagsDTO[] | undefined = [],
        prioridad: PriorityNotification | undefined = PriorityNotification.MEDIAN,
        urlDestino: string | undefined = ''
    ) {
        const notification: CreateNotificationDTO = {
            titulo,
            mensaje,
            usuarioId: user._id,
            prioridad,
            tipo: TypeNotification.SUCCESS,
            urlDestino,
            invalidatesTags
        }
        return validateCustom(notification, CreateNotificationDTO, UnprocessableEntityException)
    }

    protected createInfoNotification(
        user: AuthUserDTO,
        titulo: string,
        mensaje: string,
        invalidatesTags: InvalidatesTagsDTO[] | undefined = [],
        prioridad: PriorityNotification | undefined = PriorityNotification.MEDIAN,
        urlDestino: string | undefined = ''
    ) {
        const notification: CreateNotificationDTO = {
            titulo,
            mensaje,
            usuarioId: user._id,
            prioridad,
            tipo: TypeNotification.INFO,
            urlDestino,
            invalidatesTags
        }
        return validateCustom(notification, CreateNotificationDTO, UnprocessableEntityException)
    }

    protected createErrorNotification(
        user: AuthUserDTO,
        titulo: string,
        mensaje: string,
        invalidatesTags: InvalidatesTagsDTO[] | undefined = [],
        prioridad: PriorityNotification | undefined = PriorityNotification.MEDIAN,
        urlDestino: string | undefined = ''
    ) {
        const notification: CreateNotificationDTO = {
            titulo,
            mensaje,
            usuarioId: user._id,
            prioridad,
            tipo: TypeNotification.ERROR,
            urlDestino,
            invalidatesTags
        }
        return validateCustom(notification, CreateNotificationDTO, UnprocessableEntityException)
    }
}