import { IModelInterceptor } from "../interfaces/i-model-interceptor";
import { Agency } from "../models/agency";
import { AdminResult } from "../models/admin-result";

export class AgencyInterceptor implements IModelInterceptor<Agency> {
  send(model: Partial<Agency>): Partial<Agency> {
    delete model.receiverNameInfo;
    return model;
  }

  receive(model: Agency): Agency {
    model.receiverNameInfo = AdminResult.createInstance(model);
    return model;
  }
}
