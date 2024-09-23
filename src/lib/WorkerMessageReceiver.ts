
export class WorkerMessageReceiver {
  public onMessage: ((event: MessageEvent) => void) | null = null;


  constructor(private _target: Window | Worker) {
    this._target.addEventListener('error', this._onErrorEvent.bind(this));
    this._target.addEventListener('message', this._onMessageEvent.bind(this));
    this._target.addEventListener('messageerror', this._onErrorMessageEvent.bind(this));
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

  private _onErrorEvent(event: MessageEvent | Event) {
    if (!(event instanceof MessageEvent)) return;

    console.log(event);
  }

  private _onErrorMessageEvent(event: MessageEvent | Event) {
    if (!(event instanceof MessageEvent)) return;

    console.log(event);
  }
}


