import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {GdxMawaredResponse} from '@app/models/gdx-mawared-response';

export class GdxMawaredResponseInterceptor implements IModelInterceptor<GdxMawaredResponse> {
  receive(model: GdxMawaredResponse): GdxMawaredResponse {
    return model;
  }

  send(model: Partial<GdxMawaredResponse>): Partial<GdxMawaredResponse> {
    GdxMawaredResponseInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<GdxMawaredResponse>): void {
    delete model.searchFields;
  }


}
