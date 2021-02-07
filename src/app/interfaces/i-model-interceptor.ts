export interface IModelInterceptor<T> {
  send(model: any): any;

  receive(model: T): T;
}
