import { IManifest } from './IManifest';
export declare class ExtensionLoader {
    private _urlRoot;
    private _cancelSignal;
    extensionPackageUrl: string;
    name: string | null;
    version: string | null;
    description: string | null;
    extensionCodeUrl: string | null;
    extensionManifestUrl: string | null;
    constructor(extension: string);
    onExtensionLoaded(_packageData: Record<string, any>, _manifest: IManifest): void;
    cancelLoad(): void;
    private onPackageLoaded;
}
