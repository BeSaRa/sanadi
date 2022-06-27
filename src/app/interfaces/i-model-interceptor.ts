export interface IModelInterceptor<T> {
  caseInterceptor?: IModelInterceptor<T>

  send(model: Partial<T>): Partial<T>;

  receive(model: T): T;
}
