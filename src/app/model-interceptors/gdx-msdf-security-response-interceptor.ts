import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { GdxMsdfSecurityResponse } from "@app/models/gdx-msdf-security";
import {AdminResult} from "@models/admin-result";

export class GdxMsdfSecurityResponseInterceptor implements IModelInterceptor<GdxMsdfSecurityResponse> {
  receive(model: GdxMsdfSecurityResponse): GdxMsdfSecurityResponse {
    model.statusInfo && (model.statusInfo = AdminResult.createInstance(model.statusInfo));
    return model;
  }

  send(model: Partial<GdxMsdfSecurityResponse>): Partial<GdxMsdfSecurityResponse> {
    delete model.statusInfo;

    return model;
  }
}
