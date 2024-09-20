
type TActionArgs = {
  project: Object
}

export interface IExporter {
  key: string;
  label: string;
  action(args: TActionArgs): void;
  action(args: TActionArgs): Promise<void>;
}
