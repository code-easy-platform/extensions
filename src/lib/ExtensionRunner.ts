import { WorkerMessageReceiver } from './WorkerMessageReceiver';
import { WorkerMessageSender } from './WorkerMessageSender';
import { IExporter } from './IExporter';
import { IMessage } from './IMessage';


export class ExtensionRunner {
  private _worker: Worker | null = null;
  private _workerMessageSender: WorkerMessageSender | null = null;
  private _workerMessageReceiver: WorkerMessageReceiver | null = null;

  public hasError = false;
  public hasInitialized = false;


  constructor(private _url: string) { }


  public activate() {
    const workerUrl = URL.createObjectURL(
      new Blob(
        [`import("${this._url}").then(m => new m.default(self))`],
        { type: "text/javascript" }
      )
    );

    setTimeout(() => URL.revokeObjectURL(workerUrl), 0);

    this._worker = new Worker(workerUrl, { type: 'module' });
    this._workerMessageSender = new WorkerMessageSender(this._worker);
    this._workerMessageReceiver = new WorkerMessageReceiver(this._worker);

    this._workerMessageReceiver.onMessage = this._onEvent.bind(this);

    this._workerMessageSender.send({ type: 'activate' })
      .then(() => this.hasInitialized = true)
      .catch(() => console.warn('Failed to activate a extension'))
  }

  public deactivate() {
    this._workerMessageSender?.send({ type: 'deactivate' })
      .then(() => {
        this._worker?.terminate();

        this._worker = null;
        this.hasInitialized = false;
        this._workerMessageSender = null;
      })
      .catch(() => console.warn('Failed to deactivate a extension'));
  }


  private _onEvent(message: IMessage) {
    switch (message.type) {
      case 'add:exporter':
        this._handleAddExporter(message.payload);
        break;
      case 'remove:exporter':
        this._handleRemoveExporter(message.payload);
        break;
      case 'download:file':
        this._handleDownloadFile(message.payload);
        break;

      default: break;
    }
  }


  private _handleAddExporter(payload: Pick<IExporter, 'key' | 'label'>) {
    if (!payload) return;

    ExtensionRunner.addExporter({
      key: payload.key,
      label: payload.label,
      action: async (data: { project: Object }) => {
        await this._workerMessageSender?.send({ payload: data, type: `exporters:${payload.key}` })
      },
    });
  }

  private _handleRemoveExporter(payload: string) {
    if (!payload) return;

    ExtensionRunner.removeExporter(payload);
  }

  private _handleDownloadFile(payload: { fileName: string; fileType: string; fileContent: string; }) {
    if (!payload) return;

    ExtensionRunner.downloadFile(payload.fileName, payload.fileType, payload.fileContent);
  }


  public static addExporter(exporter: IExporter) {
    throw new Error("Add exporter method not implemented yet");
  }

  public static removeExporter(key: string) {
    throw new Error("Remove exporter method not implemented yet");
  }

  public static downloadFile(fileName: string, fileType: string, fileContent: string) {
    throw new Error("Download file method not implemented yet");
  }
}
