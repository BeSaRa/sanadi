export interface IModelInterceptor<T> {
  send(model: Partial<T>): Partial<T>;

  receive(model: T): T;
}
