import { CommonNotification } from '@Shared/Domain'

export class BulkExit extends CommonNotification {
    protected invalidatesTags = ['warehouseExitApi']
}