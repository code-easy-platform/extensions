import { IObservable } from 'react-observing/dist/interfaces/IObservable';
import { observe } from 'react-observing/dist/core/Observe';

import { ExtensionWorker } from './ExtensionWorker';
import { ExtensionLoader } from './ExtensionLoader';
import { IExporter } from '../IExporter';
import { IMessage } from '../IMessage';


export class ExtensionRunner {
  public static debug = false;
  private _debug(key: string, ...rest: any[]) {
    if (!ExtensionRunner.debug) return;
    console.log(key, ...rest);
  }

  private _extensionId: string;
  private _extensionLoader: ExtensionLoader;
  private _extensionWorker: ExtensionWorker | null = null;

  public loading = observe(false);

  public name: IObservable<string | null> = observe(null);
  public version: IObservable<string | null> = observe(null);
  public packageName: IObservable<string | null> = observe(null);
  public description: IObservable<string | null> = observe(null);
  public exporters: IObservable<IExporter[]> = observe([]);


  constructor(url: string);
  constructor(packageName: string);
  constructor(extensionPackageOrUrl: string) {
    this._debug('start - extensionPackageOrUrl', extensionPackageOrUrl);

    this.loading.value = true;
    this._extensionId = crypto.randomUUID();
    this._extensionLoader = new ExtensionLoader(extensionPackageOrUrl);

    this._extensionLoader.onExtensionLoaded = (_packageData, _manifestData) => {
      this._debug('extension - loaded', _packageData, _manifestData);

      this.name.value = _manifestData.name;
      this.description.value = _manifestData.description;
      this.packageName.value = _manifestData.packageName;
      this.version.value = this._extensionLoader.version;

      this.exporters.value = _manifestData.exporters.map(exporterData => ({
        label: exporterData.label,
        description: exporterData.description,
        key: `${this._extensionId}::${exporterData.key}`,
        action: async (data: { project: Object }) => {
          this._debug('exporter - data,exporter', data, exporterData);
          await this._extensionWorker?.send({ payload: data, type: `exporters:${exporterData.key}` })
        },
      }));

      this._extensionWorker = new ExtensionWorker(this._extensionLoader.extensionCodeUrl || '', this._onReceive.bind(this));

      this.loading.value = false;
    }
  }


  public async deactivate() {
    this._extensionLoader.cancelLoad();
    await this._extensionWorker?.deactivate();
    ExtensionRunner.removeExporters(this.exporters.value.map(exporter => exporter.key));
  }


  private _onReceive(message: IMessage) {
    switch (message.type) {
      case 'feedback':
        this._handleFeedback(message.payload);
        break;
      case 'download:file':
        this._handleDownloadFile(message.payload);
        break;
      case 'ready':
        ExtensionRunner.addExporters(this.exporters.value);
        break;

      default: break;
    }
  }

  private _handleDownloadFile(payload: { fileName: string; fileType: string; fileContent: string; }) {
    if (!payload) return;

    ExtensionRunner.downloadFile(payload.fileName, payload.fileType, payload.fileContent);
  }

  private _handleFeedback(payload: { message: string; type: 'warning' | 'success' | 'error' | 'info'; }) {
    if (!payload) return;

    ExtensionRunner.feedback(payload.message, payload.type);
  }


  public static addExporters(_exporters: IExporter[]) {
    throw new Error("Download file method not implemented yet");
  }

  public static removeExporters(_keys: string[]) {
    throw new Error("Download file method not implemented yet");
  }

  public static downloadFile(_fileName: string, _fileType: string, _fileContent: string) {
    throw new Error("Download file method not implemented yet");
  }

  public static feedback(_message: string, _type: 'warning' | 'success' | 'error' | 'info') {
    throw new Error("Feedback method not implemented yet");
  }
}
