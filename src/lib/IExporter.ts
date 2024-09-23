
type TActionArgs = {
  project: Object
}

export interface IExporter {
  key: string;
  label: string;
  description: string;
  action(args: TActionArgs): void;
  action(args: TActionArgs): Promise<void>;
}
