import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {GdxKahramaaResponse} from '@app/models/gdx-kahramaa-response';

export class GdxKahramaaResponseInterceptor implements IModelInterceptor<GdxKahramaaResponse>{
  receive(model: GdxKahramaaResponse): GdxKahramaaResponse {
    return model;
  }

  send(model: Partial<GdxKahramaaResponse>): Partial<GdxKahramaaResponse> {
    GdxKahramaaResponseInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<GdxKahramaaResponse>): void {
    delete model.searchFields;
  }
}
