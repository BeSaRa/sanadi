import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {AdminResult} from "@app/models/admin-result";
import {Fundraising} from "@app/models/fundraising";

export class FundraisingInterceptor implements IModelInterceptor<Fundraising> {
  send(model: Partial<Fundraising>): Partial<Fundraising> {
    delete model.requestTypeInfo;
    delete model.licenseStatusInfo;
    delete model.licenseDurationTypeInfo;
    return model;
  }

  receive(model: Fundraising): Fundraising {
    model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo);
    model.licenseStatusInfo = AdminResult.createInstance(model.licenseStatusInfo);
    model.licenseDurationTypeInfo = AdminResult.createInstance(model.licenseDurationTypeInfo);
    return model;
  }
}
