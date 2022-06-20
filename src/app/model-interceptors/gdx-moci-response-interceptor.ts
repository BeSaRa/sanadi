import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {GdxMociResponse} from '@app/models/gdx-moci-response';

export class GdxMociResponseInterceptor implements IModelInterceptor<GdxMociResponse> {
  receive(model: GdxMociResponse): GdxMociResponse {
    return model;
  }

  send(model: Partial<GdxMociResponse>): Partial<GdxMociResponse> {
    return model;
  }
}
