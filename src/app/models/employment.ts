import { Employee } from './employee';
import { HasLicenseDurationType } from '@contracts/has-license-duration-type';
import { CaseTypes } from '@app/enums/case-types.enum';
import { mixinLicenseDurationType } from "@app/mixins/mixin-license-duration";
import { Validators } from "@angular/forms";
import { FactoryService } from "@services/factory.service";
import { InterceptModel } from "@decorators/intercept-model";
import { EmploymentInterceptor } from "./../model-interceptors/employment-interceptor";
import { EmploymentService } from "@services/employment.service";
import { CaseModel } from "@app/models/case-model";
import { HasRequestType } from "@app/interfaces/has-request-type";
import { mixinRequestType } from "@app/mixins/mixin-request-type";

const _RequestType = mixinLicenseDurationType(mixinRequestType(CaseModel));
const interceptor = new EmploymentInterceptor();

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive,
})
export class Employment
  extends _RequestType<EmploymentService, Employment>
  implements HasRequestType, HasLicenseDurationType {
  service!: EmploymentService;
  caseType: number = CaseTypes.EMPLOYMENT;
  requestType!: number;
  category!: number;
  description: string = "";
  employeeInfoDTOs: Partial<Employee>[] = [];
  oldLicenseId!: string;
  oldLicenseSerial!: number;
  oldLicenseFullSerial!: string;
  constructor() {
    super();
    this.service = FactoryService.getService("EmploymentService");
  }

  formBuilder(controls?: boolean) {
    const { requestType, category, description } = this;
    return {
      requestType: controls ? [requestType, Validators.required] : requestType,
      category: controls ? [category, Validators.required] : category,
      description: controls ? [description] : description
    };
  }
  setLicense({
    oldLicenseId,
    oldLicenseSerial,
    oldLicenseFullSerial
  }: {
    oldLicenseId: string,
    oldLicenseSerial: number,
    oldLicenseFullSerial: string
  }) {
    this.oldLicenseId = oldLicenseId
    this.oldLicenseSerial = oldLicenseSerial
    this.oldLicenseFullSerial = oldLicenseFullSerial
  }
}
