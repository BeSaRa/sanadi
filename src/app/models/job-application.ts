import { Validators } from '@angular/forms';
import { FactoryService } from './../services/factory.service';
import { InterceptModel } from "@decorators/intercept-model";
import { JobApplicationInterceptor } from "./../model-interceptors/job-application-interceptor";
import { JobApplicationService } from "./../services/job-application.service";
import { CaseModel } from "@app/models/case-model";

const interceptor = new JobApplicationInterceptor();

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive,
})
export class JobApplication extends CaseModel<
  JobApplicationService,
  JobApplication
> {
  service!: JobApplicationService;
  requestType!: number;
  category!: number;
  constructor() {
    super();
    this.service = FactoryService.getService('JobApplicationService');
  }

  formBuilder(controls?: boolean) {
    const {
      requestType,
      category
    } = this;
    return {
      requestType: controls ? [requestType, Validators.required] : requestType,
      category: controls ? [category, Validators.required] : category,
    }
  }
}
