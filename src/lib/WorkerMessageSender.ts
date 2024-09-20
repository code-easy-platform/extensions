import { IMessage } from './IMessage';


export class WorkerMessageSender {
  private _messageQueue: Record<string, (() => void)> = {};


  constructor(private _target: Window | Worker) {
    this._target.onerror = this._onErrorEvent.bind(this);
    this._target.onmessageerror = this._onErrorMessageEvent.bind(this);

    this._target.addEventListener('error', this._onErrorEvent.bind(this));
    this._target.addEventListener('message', this._onMessageEvent.bind(this));
    this._target.addEventListener('messageerror', this._onErrorMessageEvent.bind(this));
  }


  public async send<T>(message: IMessage<T>) {
    return new Promise((resolve, reject) => {
      const newMessageId = crypto.randomUUID();

      this._messageQueue[newMessageId] = () => {
        delete this._messageQueue[newMessageId];
        resolve('complete');
      };

      this._target.postMessage({
        type: 'request',
        payload: message,
        messageId: newMessageId,
      });


      setTimeout(() => {
        delete this._messageQueue[newMessageId];
        reject('Time out');
      }, 500);
    });
  }


  private _onErrorEvent(event: MessageEvent | Event) {
    if (!(event instanceof MessageEvent)) return;

    console.log(event);
  }

  private _onErrorMessageEvent(event: MessageEvent | Event) {
    if (!(event instanceof MessageEvent)) return;

    console.log(event);
  }

  private _onMessageEvent(event: MessageEvent | Event) {
    if (!(event instanceof MessageEvent)) return;
    if (event.data.type !== 'response') return;

    this._messageQueue[event.data.messageId]?.();
  }
}
