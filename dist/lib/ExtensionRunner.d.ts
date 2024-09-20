import { IExporter } from './IExporter';
export declare class ExtensionRunner {
    private _url;
    private _worker;
    private _workerMessageSender;
    private _workerMessageReceiver;
    hasError: boolean;
    hasInitialized: boolean;
    constructor(_url: string);
    activate(): void;
    deactivate(): void;
    private _onEvent;
    private _handleAddExporter;
    private _handleRemoveExporter;
    private _handleDownloadFile;
    static addExporter(exporter: IExporter): void;
    static removeExporter(key: string): void;
    static downloadFile(fileName: string, fileType: string, fileContent: string): void;
}
