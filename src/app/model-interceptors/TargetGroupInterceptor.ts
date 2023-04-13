import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {TargetGroup} from "@app/models/target-group";

export class TargetGroupInterceptor implements IModelInterceptor<TargetGroup> {
  send(model: Partial<TargetGroup>): Partial<TargetGroup> {
    delete model.searchFields;
    delete model.auditOperation;
    return model;
  }

  receive(model: TargetGroup): TargetGroup {
    return model;
  }
}
