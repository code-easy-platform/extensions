import { TFileToDownload } from './runner/IFileToDownload';
export declare abstract class Extension {
    private _commands;
    private _workerReceiver;
    private _workerSender;
    constructor(_target: Window | Worker);
    /**
     * First function call when extension starts.
     */
    abstract activate(): void;
    /**
     * Last function call when extension ends.
     */
    abstract deactivate(): void;
    /**
     * All available commands to do in the platform
     */
    readonly commands: {
        /**
         * Allow you to add a project exporter in the platform. You can develop a code export.
         *
         * @param key Key of the exporter previous added
         * @param action Function to be executed when the event was called
         */
        readonly addExporter: (key: string, action: ((data: any) => void)) => Promise<void>;
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
         * Allow you to download a lot of files and folders as zip
         *
         * @param downloadName Name of the download as zip
         * @param files List of files or folders to download
         */
        readonly downloadFiles: (downloadName: string, files: TFileToDownload) => Promise<void>;
        /**
         * Allow to show some feedback to the platform user
         *
         * @param message Message of the feedback
         * @param type type of the feedback
         */
        readonly feedback: (message: string, type: "warning" | "success" | "error" | "info") => Promise<void>;
    };
    private _onEvent;
    private _handleReady;
}
