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
    name: string | null;
    /**
     * Use this prop to create a good description of the extension. This will be showed in the platform.
     */
    description: string | null;
    /**
     * First function call when extension starts.
     */
    activate(): void;
    /**
     * Last function call when extension ends.
     */
    deactivate(): void;
    /**
     * All available commands to do in the platform
     */
    readonly commands: {
        /**
         * Allow you to add a project exporter in the platform. You can develop a code export.
         *
         * @param exporter Object with a action
         */
        readonly addExporter: (exporter: Pick<IExporter, "key" | "label"> & {
            action: ((data: any) => void);
        }) => Promise<void>;
        /**
         * Used to remove the project exporter
         *
         * @param key Key of the exporter previous added
         */
        readonly removeExporter: (key: string) => Promise<void>;
        /**
         * Allow you to download some content in a file
         *
         * @param fileName Name of the generated file
         * @param fileType extension of the file
         * @param fileContent file content in string
         */
        readonly downloadFile: (fileName: string, fileType: string, fileContent: string) => Promise<void>;
        /**
         * Allow to show some feedback to the platform user
         *
         * @param message Message of the feedback
         * @param type type of the feedback
         */
        readonly feedback: (message: string, type: "warning" | "success" | "error" | "info") => Promise<void>;
    };
    private _onEvent;
    private _handleInformation;
}
