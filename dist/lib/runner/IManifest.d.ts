import { IExporter } from '../IExporter';
export interface IManifest {
    name: string;
    packageName: string;
    description: string;
    exporters: Pick<IExporter, 'key' | 'label' | 'description'>[];
}
