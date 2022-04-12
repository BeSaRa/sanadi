import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { AdminResult } from "@app/models/admin-result";
import { ShippingApproval } from "@app/models/shipping-approval";

export class ShippingApprovalInterceptor
  implements IModelInterceptor<ShippingApproval>
{
  send(model: Partial<ShippingApproval>): Partial<ShippingApproval> {
    delete model.requestTypeInfo;
    return model;
  }
  receive(model: ShippingApproval): ShippingApproval {
    model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo);
    return model;
  }
}