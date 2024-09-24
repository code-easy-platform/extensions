import { IObservable } from 'react-observing/dist/interfaces/IObservable';
import { TFileToDownload } from './IFileToDownload';
import { IExporter } from '../IExporter';
export declare class ExtensionRunner {
    static debug: boolean;
    private _debug;
    private _extensionId;
    private _extensionLoader;
    private _extensionWorker;
    loading: IObservable<boolean>;
    url: IObservable<string | null>;
    name: IObservable<string | null>;
    version: IObservable<string | null>;
    packageName: IObservable<string | null>;
    description: IObservable<string | null>;
    exporters: IObservable<IExporter[]>;
    constructor(url: string);
    constructor(packageName: string);
    deactivate(): Promise<void>;
    private _onReceive;
    private _handleDownloadFile;
    private _handleDownloadFiles;
    private _handleFeedback;
    static addExporters(_exporters: IExporter[]): void;
    static removeExporters(_keys: string[]): void;
    static downloadFile(_fileName: string, _fileType: string, _fileContent: string): void;
    static downloadFiles(_downloadName: string, _files: TFileToDownload[]): void;
    static feedback(_message: string, _type: 'warning' | 'success' | 'error' | 'info'): void;
}
