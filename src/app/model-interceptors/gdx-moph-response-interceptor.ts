import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {GdxMophResponse} from '@app/models/gdx-moph-response';

export class GdxMophResponseInterceptor implements IModelInterceptor<GdxMophResponse> {
  receive(model: GdxMophResponse): GdxMophResponse {
    return model;
  }

  send(model: Partial<GdxMophResponse>): Partial<GdxMophResponse> {
    return model;
  }
}
