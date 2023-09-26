import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { GdxMsdfSecurityResponse } from "@app/models/gdx-msdf-security";

export class GdxMsdfSecurityResponseInterceptor implements IModelInterceptor<GdxMsdfSecurityResponse> {
  receive(model: GdxMsdfSecurityResponse): GdxMsdfSecurityResponse {

    return model;
  }

  send(model: Partial<GdxMsdfSecurityResponse>): Partial<GdxMsdfSecurityResponse> {

    return model;
  }
}
