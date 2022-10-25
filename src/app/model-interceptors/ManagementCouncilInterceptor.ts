import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import { AdminResult } from "@app/models/admin-result";
import {ManagementCouncil} from "@app/models/management-council";

export class ManagementCouncilInterceptor implements IModelInterceptor<ManagementCouncil> {
  send(model: Partial<ManagementCouncil>): Partial<ManagementCouncil> {
    delete model.searchFields;
    delete model.countryInfo;
    return model;
  }

  receive(model: ManagementCouncil): ManagementCouncil {
    model.countryInfo = AdminResult.createInstance(model.countryInfo);

    return model;
  }
}
