import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import { AdminResult } from "@app/models/admin-result";
import {ManagementCouncil} from "@app/models/management-council";

export class ManagementCouncilInterceptor implements IModelInterceptor<ManagementCouncil> {
  send(model: Partial<ManagementCouncil>): Partial<ManagementCouncil> {
    delete model.searchFields;
    delete model.nationalityInfo;
    delete model.auditOperation;
    return model;
  }

  receive(model: ManagementCouncil): ManagementCouncil {
    model.nationalityInfo = AdminResult.createInstance(model.nationalityInfo);

    return model;
  }
}
