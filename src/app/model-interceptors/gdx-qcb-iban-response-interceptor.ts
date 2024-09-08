import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {GdxQcbIbanResponse} from '@models/gdx-qcb-iban-response';

export class GdxQcbIbanResponseInterceptor implements IModelInterceptor<GdxQcbIbanResponse> {
  receive(model: GdxQcbIbanResponse): GdxQcbIbanResponse {
    return model;
  }

  send(model: Partial<GdxQcbIbanResponse>): Partial<GdxQcbIbanResponse> {

    return model;
  }
}
