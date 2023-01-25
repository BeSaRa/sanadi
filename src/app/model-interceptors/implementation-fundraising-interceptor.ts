import {IModelInterceptor} from "@contracts/i-model-interceptor";
import {ImplementationFundraising} from "@models/implementation-fundraising";
import {AdminResult} from "@models/admin-result";

export class ImplementationFundraisingInterceptor implements IModelInterceptor<ImplementationFundraising> {
  send(model: Partial<ImplementationFundraising>): Partial<ImplementationFundraising> {
    delete model.permitTypeInfo
    return model;
  }

  receive(model: ImplementationFundraising): ImplementationFundraising {
    model.permitTypeInfo = AdminResult.createInstance(model.permitTypeInfo)
    return model;
  }
}
