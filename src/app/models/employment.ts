import { ContractTypes } from '@app/enums/contract-types.enum';
import { EmploymentCategory } from '@app/enums/employment-category.enum';
import { EmploymentRequestType } from '@app/enums/employment-request-type';
import { IMyDateModel } from 'angular-mydatepicker';
import { WFResponseType } from './../enums/wfresponse-type.enum';
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
import { CaseModelContract } from "@contracts/case-model-contract";
import { DialogRef } from '@app/shared/models/dialog-ref';

const _RequestType = mixinLicenseDurationType(mixinRequestType(CaseModel));
const interceptor = new EmploymentInterceptor();

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive,
})
export class Employment
  extends _RequestType<EmploymentService, Employment>
  implements HasRequestType, HasLicenseDurationType, CaseModelContract<EmploymentService, Employment> {
  service!: EmploymentService;
  caseType: number = CaseTypes.EMPLOYMENT;
  requestType!: number;
  category!: number;
  description: string = "";
  employeeInfoDTOs: Partial<Employee>[] = [];
  exportedLicenseId!: string;
  oldLicenseId!: string;
  oldLicenseSerial!: number;
  oldLicenseFullSerial!: string;
  licenseStartDate!: string | IMyDateModel;
  licenseEndDate!: string | IMyDateModel;
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
  intirmDateFormBuilder() {
    const { requestType, licenseStartDate, licenseEndDate } = this;
    return {
      licenseStartDate: [licenseStartDate, !this.isApproval() || this.isCancelRequestType() ? [] : Validators.required],
      licenseEndDate: [licenseEndDate, !this.isInterm() || !this.isApproval() || this.isCancelRequestType() ? [] : Validators.required],
    };
  }
  approve(): DialogRef {
    return this.service.approve(this, WFResponseType.APPROVE)
  }
  finalApprove(): DialogRef {
    return this.service.approve(this, WFResponseType.FINAL_APPROVE)
  }

  isApproval() {
    return this.category == EmploymentCategory.APPROVAL
  }
  isCancelRequestType(): boolean {
    return this.requestType === EmploymentRequestType.CANCEL;
  }
  isInterm() {
    return this.employeeInfoDTOs[0].contractType == ContractTypes.Interim
  }
}
