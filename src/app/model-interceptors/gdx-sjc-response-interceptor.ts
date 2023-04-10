import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {GdxSjcMaritalStatusResponse} from '@models/gdx-sjc-marital-status-response';

export class GdxSjcResponseInterceptor implements IModelInterceptor<GdxSjcMaritalStatusResponse> {
  receive(model: GdxSjcMaritalStatusResponse): GdxSjcMaritalStatusResponse {
    return model;
  }

  send(model: Partial<GdxSjcMaritalStatusResponse>): Partial<GdxSjcMaritalStatusResponse> {
    GdxSjcResponseInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<GdxSjcMaritalStatusResponse>): void {
    delete model.langService;
    delete model.searchFields;
  }
}
