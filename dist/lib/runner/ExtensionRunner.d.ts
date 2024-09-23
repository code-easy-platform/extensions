import { IExporter } from '../IExporter';
export declare class ExtensionRunner {
    static debug: boolean;
    private _debug;
    private _extensionId;
    private _extensionLoader;
    private _extensionWorker;
    name: string | null;
    version: string | null;
    packageName: string | null;
    description: string | null;
    exporters: IExporter[];
    constructor(url: string);
    constructor(packageName: string);
    deactivate(): Promise<void>;
    private _onReceive;
    private _handleDownloadFile;
    private _handleFeedback;
    static addExporters(_exporters: IExporter[]): void;
    static removeExporters(_keys: string[]): void;
    static downloadFile(_fileName: string, _fileType: string, _fileContent: string): void;
    static feedback(_message: string, _type: 'warning' | 'success' | 'error' | 'info'): void;
}
