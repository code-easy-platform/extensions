import { IExporter } from './IExporter';
export declare class ExtensionRunner {
    private _url;
    private _worker;
    private _workerMessageSender;
    private _workerMessageReceiver;
    name: null;
    hasError: boolean;
    description: null;
    hasInitialized: boolean;
    constructor(_url: string);
    activate(): void;
    deactivate(): void;
    private _onEvent;
    private _handleAddExporter;
    private _handleRemoveExporter;
    private _handleDownloadFile;
    private _handleFeedback;
    static addExporter(_exporter: IExporter): void;
    static removeExporter(_key: string): void;
    static downloadFile(_fileName: string, _fileType: string, _fileContent: string): void;
    static feedback(_message: string, _type: string): void;
}
