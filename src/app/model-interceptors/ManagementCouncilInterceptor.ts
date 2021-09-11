import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {ManagementCouncil} from "@app/models/management-council";

export class ManagementCouncilInterceptor implements IModelInterceptor<ManagementCouncil> {
  send(model: Partial<ManagementCouncil>): Partial<ManagementCouncil> {
    delete model.searchFields;
    return model;
  }

  receive(model: ManagementCouncil): ManagementCouncil {
    return model;
  }
}
