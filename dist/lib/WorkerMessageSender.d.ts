import { IMessage } from './IMessage';
export declare class WorkerMessageSender {
    private _target;
    private _messageQueue;
    constructor(_target: Window | Worker);
    send<T>(message: IMessage<T>): Promise<unknown>;
    private _onMessageEvent;
}
