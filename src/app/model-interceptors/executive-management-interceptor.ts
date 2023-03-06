import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { AdminResult } from "@app/models/admin-result";
import { ExecutiveManagement } from '@app/models/executive-management';

export class ExecutiveManagementInterceptor implements IModelInterceptor<ExecutiveManagement> {
  send(model: Partial<ExecutiveManagement>): Partial<ExecutiveManagement> {
    delete model.searchFields;
    delete model.nationalityInfo;
    delete model.searchFieldsNoPassport;

    return model;
  }

  receive(model: ExecutiveManagement): ExecutiveManagement {
    model.nationalityInfo = model.nationalityInfo ? AdminResult.createInstance(model.nationalityInfo) : AdminResult.createInstance({});

    return model;
  }
}
