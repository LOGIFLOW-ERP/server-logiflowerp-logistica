import { CommonNotification } from '@Shared/Domain'

export class BulkExit extends CommonNotification {
    protected path = 'processes/warehouseExit'
    protected api = 'warehouseExitApi'
    protected invalidatesTags = [
        { api: this.api, type: this.path, id: `LIST${this.path}` },
        { api: this.api, type: this.path, id: `LIST1${this.path}` },
        { api: this.api, type: this.path, id: `STATIC_PIPELINE${this.path}` },
        { api: this.api, type: this.path, id: `PIPELINE${this.path}` },
    ]
}