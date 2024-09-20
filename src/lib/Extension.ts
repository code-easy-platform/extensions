import { WorkerMessageReceiver } from './WorkerMessageReceiver';
import { WorkerMessageSender } from './WorkerMessageSender';
import { IExporter } from './IExporter';
import { IMessage } from './IMessage';


export class Extension {
  private _extensionId = crypto.randomUUID();
  private _commands: Record<string, ((data: any) => void)> = {};

  private _workerReceiver: WorkerMessageReceiver;
  private _workerSender: WorkerMessageSender;


  constructor(_target: Window | Worker) {
    this._workerReceiver = new WorkerMessageReceiver(_target);
    this._workerSender = new WorkerMessageSender(_target);

    this._commands['activate'] = this.activate.bind(this);
    this._commands['deactivate'] = this.deactivate.bind(this);

    this._workerReceiver.onMessage = this._onEvent.bind(this);

    this._onInit();
  }


  /**
   * Use this prop to create a good name of the extension. This will be showed in the platform.
   */
  public name = null;
  /**
   * Use this prop to create a good description of the extension. This will be showed in the platform.
   */
  public description = null;
  /**
   * First function call when extension starts.
   */
  public activate() { }
  /**
   * Last function call when extension ends.
   */
  public deactivate() { }


  public async addExporter(exporter: Pick<IExporter, 'key' | 'label'> & { action: ((data: any) => void) }) {
    const commandKey = `${this._extensionId}:${exporter.key}`;

    this._commands[`exporters:${commandKey}`] = exporter.action.bind(this);

    await this._workerSender.send({
      type: 'add:exporter',
      payload: {
        key: commandKey,
        label: exporter.label,
      },
    });
  }

  public async removeExporter(key: string) {
    const commandKey = `${this._extensionId}:${key}`;

    delete this._commands[`exporters:${commandKey}`];

    await this._workerSender.send({
      type: 'remove:exporter',
      payload: commandKey,
    });
  }

  public async downloadFile(fileName: string, fileType: string, fileContent: string) {
    await this._workerSender.send({
      type: 'download:file',
      payload: { fileName, fileType, fileContent },
    });
  }


  private _onEvent(message: IMessage) {
    this._commands[message.type]?.(message.payload);
  }

  private async _onInit() {
    await this._workerSender.send({
      type: 'set:name',
      payload: this.name || 'Nothing set here',
    });
    await this._workerSender.send({
      type: 'set:description',
      payload: this.description || 'Nothing set here',
    });
  }
}
