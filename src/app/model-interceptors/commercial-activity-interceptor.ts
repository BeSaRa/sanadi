import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { CommercialActivity } from "@app/models/commercial-activity";

export class CommercialActivityInterceptor implements IModelInterceptor<CommercialActivity> {
  send(model: Partial<CommercialActivity>): Partial<CommercialActivity> {
    delete model.searchFields;
    delete model.auditOperation;
    return model;
  }

  receive(model: CommercialActivity): CommercialActivity {
    return model;
  }
}
