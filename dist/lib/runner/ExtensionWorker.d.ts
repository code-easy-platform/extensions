import { IMessage } from '../IMessage';
export declare class ExtensionWorker {
    private _worker;
    private _workerMessageSender;
    private _workerMessageReceiver;
    private _ready;
    get ready(): boolean;
    private _hasError;
    get hasError(): boolean;
    private _hasInitialized;
    get hasInitialized(): boolean;
    constructor(url: string, onReceive: (_message: IMessage) => void);
    activate(): Promise<void>;
    deactivate(): Promise<void>;
    send<T>(message: IMessage<T>): Promise<unknown>;
    private _onReceive;
}
