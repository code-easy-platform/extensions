import { IExporter } from './IExporter';
export declare class Extension {
    private _extensionId;
    private _commands;
    private _workerReceiver;
    private _workerSender;
    constructor(_target: Window | Worker);
    activate(): void;
    deactivate(): void;
    addExporter(exporter: Pick<IExporter, 'key' | 'label'> & {
        action: ((data: any) => void);
    }): Promise<void>;
    removeExporter(key: string): Promise<void>;
    downloadFile(fileName: string, fileType: string, fileContent: string): Promise<void>;
    private _onEvent;
}
