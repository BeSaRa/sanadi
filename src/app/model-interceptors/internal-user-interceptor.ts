import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {InternalUser} from '../models/internal-user';
import {AdminResult} from "@app/models/admin-result";

export class InternalUserInterceptor implements IModelInterceptor<InternalUser> {
  send(model: Partial<InternalUser>): Partial<InternalUser> {
    delete model.defaultDepartmentInfo;
    delete model.jobTitleInfo;
    delete model.statusInfo;
    delete model.service;
    delete model.langService;
    return model;
  }

  receive(model: InternalUser): InternalUser {
    model.defaultDepartmentInfo = AdminResult.createInstance(model.defaultDepartmentInfo);
    model.jobTitleInfo = AdminResult.createInstance(model.jobTitleInfo);
    model.statusInfo = AdminResult.createInstance(model.statusInfo);
    return model;
  }

}
