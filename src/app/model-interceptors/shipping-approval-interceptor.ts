import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { ShippingApproval } from "@app/models/shipping-approval";

export class ShippingApprovalInterceptor
  implements IModelInterceptor<ShippingApproval>
{
  send(model: Partial<ShippingApproval>): Partial<ShippingApproval> {
    return model;
  }
  receive(model: ShippingApproval): ShippingApproval {
    return model;
  }
}