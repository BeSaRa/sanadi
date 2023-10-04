import { GdxQCBResponse } from '@app/models/gdx-qcb-response';
import {IModelInterceptor} from '@contracts/i-model-interceptor';

export class GdxQCBResponseInterceptor implements IModelInterceptor<GdxQCBResponse> {
  receive(model: GdxQCBResponse): GdxQCBResponse {
    return model;
  }

  send(model: Partial<GdxQCBResponse>): Partial<GdxQCBResponse> {
    return model;
  }
}
