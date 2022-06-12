import { CaseTypes } from '@app/enums/case-types.enum';
import { IEmployeeDto } from "./../interfaces/i-employee-dto";
import { mixinLicenseDurationType } from "@app/mixins/mixin-license-duration";
import { Validators } from "@angular/forms";
import { FactoryService } from "./../services/factory.service";
import { InterceptModel } from "@decorators/intercept-model";
import { JobApplicationInterceptor } from "./../model-interceptors/job-application-interceptor";
import { JobApplicationService } from "./../services/job-application.service";
import { CaseModel } from "@app/models/case-model";
import { HasRequestType } from "@app/interfaces/has-request-type";
import { mixinRequestType } from "@app/mixins/mixin-request-type";

const _RequestType = mixinLicenseDurationType(mixinRequestType(CaseModel));
const interceptor = new JobApplicationInterceptor();

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive,
})
export class JobApplication
  extends _RequestType<JobApplicationService, JobApplication>
  implements HasRequestType
{
  service!: JobApplicationService;
  caseType:number = CaseTypes.JOB_APPLICATION;
  requestType!: number;
  category!: number;
  description: string = "";
  employeeInfoDTOs: IEmployeeDto[] = [];
  constructor() {
    super();
    this.service = FactoryService.getService("JobApplicationService");
  }

  formBuilder(controls?: boolean) {
    const { requestType, category, description } = this;
    return {
      requestType: controls ? [requestType, Validators.required] : requestType,
      category: controls ? [category, Validators.required] : category,
      description: controls ? [description] : description
    };
  }
}
