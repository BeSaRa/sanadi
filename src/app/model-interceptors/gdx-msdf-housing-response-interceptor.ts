import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {GdxMsdfHousingResponse} from "@app/models/gdx-msdf-housing";

export class GdxMsdfHousingResponseInterceptor implements IModelInterceptor<GdxMsdfHousingResponse> {
  receive(model: GdxMsdfHousingResponse): GdxMsdfHousingResponse {
    // manually mapping values of status until BE changes to string
    if (model.status === 0) {
      model.statusString = 'غير منتفع';
    } else if (model.status === 1) {
      model.statusString = 'منتفع';
    } else {
      model.statusString = '' + model.status;
    }
    return model;
  }

  send(model: Partial<GdxMsdfHousingResponse>): Partial<GdxMsdfHousingResponse> {
    delete model.statusString;

    return model;
  }
}
