import { WorkerMessageReceiver } from '../WorkerMessageReceiver';
import { WorkerMessageSender } from '../WorkerMessageSender';
import { IMessage } from '../IMessage';


export class ExtensionWorker {
  private _worker: Worker | null = null;
  private _workerMessageSender: WorkerMessageSender | null = null;
  private _workerMessageReceiver: WorkerMessageReceiver | null = null;


  private _ready = false;
  public get ready() { return this._ready; }

  private _hasError = false;
  public get hasError() { return this._hasError; }

  private _hasInitialized = false;
  public get hasInitialized() { return this._hasInitialized; }


  constructor(
    url: string,
    onReceive: (_message: IMessage) => void,
  ) {
    const workerUrl = URL.createObjectURL(
      new Blob(
        [`import("${url}").then(m => new m.default(self))`],
        { type: "text/javascript" }
      )
    );

    this._worker = new Worker(workerUrl, { type: 'module' });
    setTimeout(() => URL.revokeObjectURL(workerUrl), 0);

    this._workerMessageSender = new WorkerMessageSender(this._worker);
    this._workerMessageReceiver = new WorkerMessageReceiver(this._worker);

    this._workerMessageReceiver.onMessage = message => this._onReceive(message, onReceive);
  }


  public async activate() {
    await this._workerMessageSender?.send({ type: 'activate' })
      .then(() => {
        this._hasInitialized = true;
      })
      .catch(() => {
        this._hasError = true;
        console.warn('Failed to activate a extension');
      });
  }

  public async deactivate() {
    await this._workerMessageSender?.send({ type: 'deactivate' })
      .then(() => {
        this._worker?.terminate();

        this._worker = null;
        this._hasInitialized = false;
        this._workerMessageSender = null;
      })
      .catch(() => console.warn('Failed to deactivate a extension'));
  }

  public async send<T>(message: IMessage<T>) {
    return await this._workerMessageSender?.send(message);
  }


  private _onReceive(message: IMessage, onReceive: (_message: IMessage) => void,) {
    switch (message.type) {
      case 'ready':
        this._ready = true;
        onReceive(message);
        this.activate();
        break;

      default:
        onReceive(message);
        break;
    }
  }
}
