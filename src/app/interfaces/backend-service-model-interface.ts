import {IModelInterceptor} from './i-model-interceptor';

export interface BackendServiceModelInterface<M> {
  _getModel(): any;

  _getReceiveInterceptor(): any;

  _getSendInterceptor(): any;

  _getInterceptor(): Partial<IModelInterceptor<M>>;
}
