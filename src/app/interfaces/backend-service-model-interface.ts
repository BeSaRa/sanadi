import {IModelInterceptor} from './i-model-interceptor';

export interface BackendServiceModelInterface {
  _getModel(): any;

  _getReceiveInterceptor(): any;

  _getSendInterceptor(): any;

  _getInterceptor(): Partial<IModelInterceptor<any>>;
}
