export interface IManifest {
    name: string;
    packageName: string;
    description: string;
    exporters: {
        key: string;
        label: string;
        description: string;
    }[];
}
