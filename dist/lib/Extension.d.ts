import { IExporter } from './IExporter';
export declare class Extension {
    private _extensionId;
    private _commands;
    private _workerReceiver;
    private _workerSender;
    constructor(_target: Window | Worker);
    /**
     * Use this prop to create a good name of the extension. This will be showed in the platform.
     */
    name: null;
    /**
     * Use this prop to create a good description of the extension. This will be showed in the platform.
     */
    description: null;
    /**
     * First function call when extension starts.
     */
    activate(): void;
    /**
     * Last function call when extension ends.
     */
    deactivate(): void;
    addExporter(exporter: Pick<IExporter, 'key' | 'label'> & {
        action: ((data: any) => void);
    }): Promise<void>;
    removeExporter(key: string): Promise<void>;
    downloadFile(fileName: string, fileType: string, fileContent: string): Promise<void>;
    feedback(message: string, type: string): Promise<void>;
    private _onEvent;
    private _onInit;
}
