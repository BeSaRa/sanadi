import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {ExecutiveManagement} from '@app/models/executive-management';

export class ExecutiveManagementInterceptor implements IModelInterceptor<ExecutiveManagement> {
  send(model: Partial<ExecutiveManagement>): Partial<ExecutiveManagement> {
    delete model.searchFields;
    return model;
  }

  receive(model: ExecutiveManagement): ExecutiveManagement {
    return model;
  }
}
