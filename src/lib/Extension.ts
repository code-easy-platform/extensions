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
    this._commands['information'] = this._handleInformation.bind(this);

    this._workerReceiver.onMessage = this._onEvent.bind(this);
  }


  /**
   * Use this prop to create a good name of the extension. This will be showed in the platform.
   */
  public name: string | null = null;
  /**
   * Use this prop to create a good description of the extension. This will be showed in the platform.
   */
  public description: string | null = null;
  /**
   * First function call when extension starts.
   */
  public activate() { }
  /**
   * Last function call when extension ends.
   */
  public deactivate() { }


  /**
   * All available commands to do in the platform
   */
  public readonly commands = {
    /**
     * Allow you to add a project exporter in the platform. You can develop a code export.
     * 
     * @param exporter Object with a action
     */
    addExporter: async (exporter: Pick<IExporter, 'key' | 'label'> & { action: ((data: any) => void) }) => {
      const commandKey = `${this._extensionId}:${exporter.key}`;

      this._commands[`exporters:${commandKey}`] = exporter.action.bind(this);

      await this._workerSender.send({
        type: 'add:exporter',
        payload: {
          key: commandKey,
          label: exporter.label,
        },
      });
    },
    /**
     * Used to remove the project exporter
     * 
     * @param key Key of the exporter previous added
     */
    removeExporter: async (key: string) => {
      const commandKey = `${this._extensionId}:${key}`;

      delete this._commands[`exporters:${commandKey}`];

      await this._workerSender.send({
        type: 'remove:exporter',
        payload: commandKey,
      });
    },
    /**
     * Allow you to download some content in a file
     * 
     * @param fileName Name of the generated file
     * @param fileType extension of the file
     * @param fileContent file content in string
     */
    downloadFile: async (fileName: string, fileType: string, fileContent: string) => {
      await this._workerSender.send({
        type: 'download:file',
        payload: { fileName, fileType, fileContent },
      });
    },
    /**
     * Allow to show some feedback to the platform user
     * 
     * @param message Message of the feedback
     * @param type type of the feedback
     */
    feedback: async (message: string, type: 'warning' | 'success' | 'error' | 'info') => {
      await this._workerSender.send({
        type: 'feedback',
        payload: { message, type },
      });
    },
  } as const;


  private _onEvent(message: IMessage) {
    this._commands[message.type]?.(message.payload);
  }

  private async _handleInformation() {
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
