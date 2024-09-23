import { WorkerMessageReceiver } from './WorkerMessageReceiver';
import { WorkerMessageSender } from './WorkerMessageSender';
import { TFileToDownload } from './runner/IFileToDownload';
import { IMessage } from './IMessage';



export abstract class Extension {
  private _commands: Record<string, ((data: any) => void)> = {};

  private _workerReceiver: WorkerMessageReceiver;
  private _workerSender: WorkerMessageSender;


  constructor(_target: Window | Worker) {
    this._workerReceiver = new WorkerMessageReceiver(_target);
    this._workerSender = new WorkerMessageSender(_target);

    this._commands['activate'] = this.activate.bind(this);
    this._commands['deactivate'] = this.deactivate.bind(this);

    this._workerReceiver.onMessage = this._onEvent.bind(this);

    this._handleReady();
  }


  /**
   * First function call when extension starts.
   */
  public abstract activate(): void;
  /**
   * Last function call when extension ends.
   */
  public abstract deactivate(): void;


  /**
   * All available commands to do in the platform
   */
  public readonly commands = {
    /**
     * Allow you to add a project exporter in the platform. You can develop a code export.
     * 
     * @param key Key of the exporter previous added
     * @param action Function to be executed when the event was called
     */
    addExporter: async (key: string, action: ((data: any) => void)) => {
      const commandKey = `${key}`;
      this._commands[`exporters:${commandKey}`] = action.bind(this);
    },
    /**
     * Used to remove the project exporter
     * 
     * @param key Key of the exporter previous added
     */
    removeExporter: async (key: string) => {
      const commandKey = `${key}`;
      delete this._commands[`exporters:${commandKey}`];
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
     * Allow you to download a lot of files and folders as zip
     * 
     * @param downloadName Name of the download as zip
     * @param files List of files or folders to download
     */
    downloadFiles: async (downloadName: string, files: TFileToDownload) => {
      await this._workerSender.send({
        type: 'download:files',
        payload: { downloadName, files },
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

  private async _handleReady() {
    await this._workerSender.send({ type: 'ready' });
  }
}
