import { StateOrderWin } from 'logiflowerp-sdk';

export class Common {
    protected readonly estados = [
        StateOrderWin.FINALIZADA,
        StateOrderWin.CANCELADA,
        StateOrderWin.ANULADA
    ]
}