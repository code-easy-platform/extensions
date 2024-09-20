
export class WorkerMessageReceiver {
  public onMessage: ((event: MessageEvent) => void) | null = null;


  constructor(private _target: Window | Worker) {
    this._target.addEventListener('message', this._onMessageEvent.bind(this));
  }


  private _respond(messageId: string) {
    this._target.postMessage({ messageId, type: 'response' });
  }

  private _onMessageEvent(event: MessageEvent | Event) {
    if (!(event instanceof MessageEvent)) return;
    if (event.data.type !== 'request') return;

    this.onMessage?.(event.data.payload);
    this._respond(event.data.messageId);
  }
}
