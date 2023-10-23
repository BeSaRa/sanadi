import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {GdxMsdfHousingResponse} from "@app/models/gdx-msdf-housing";
import {AdminResult} from "@models/admin-result";

export class GdxMsdfHousingResponseInterceptor implements IModelInterceptor<GdxMsdfHousingResponse> {
  receive(model: GdxMsdfHousingResponse): GdxMsdfHousingResponse {
    model.statusInfo && (model.statusInfo = AdminResult.createInstance(model.statusInfo));
    return model;
  }

  send(model: Partial<GdxMsdfHousingResponse>): Partial<GdxMsdfHousingResponse> {
    delete model.statusInfo;

    return model;
  }
}
