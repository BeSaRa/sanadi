import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { AdminResult } from "@app/models/admin-result";
import { JobTitleClone } from "@app/models/job-title-clone";

export class JobTitleCloneInterceptor implements IModelInterceptor<JobTitleClone>{
  receive(model: JobTitleClone): JobTitleClone {
    model.statusInfo = AdminResult.createInstance(model.statusInfo)
    return model;
  }

  send(model: Partial<JobTitleClone>): Partial<JobTitleClone> {
    delete model.statusInfo;
    delete model.service;
    delete model.langService;
    return model;
  }
}
