
export interface IMessage<T = any> {
  payload?: T;
  type: string;
}
