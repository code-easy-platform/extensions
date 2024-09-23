export declare class WorkerMessageReceiver {
    private _target;
    onMessage: ((event: MessageEvent) => void) | null;
    constructor(_target: Window | Worker);
    private _respond;
    private _onMessageEvent;
    private _onErrorEvent;
    private _onErrorMessageEvent;
}
