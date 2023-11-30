import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { dateSearchFields } from '@app/helpers/date-search-fields';
import { ControlValueLabelLangKey, ISearchFieldsMap } from './../types/types';
import { ContractTypes } from '@app/enums/contract-types.enum';
import { EmploymentCategory } from '@app/enums/employment-category.enum';
import { EmploymentRequestType } from '@app/enums/service-request-types';
import { IMyDateModel } from 'angular-mydatepicker';
import { WFResponseType } from '@enums/wfresponse-type.enum';
import { Employee } from './employee';
import { HasLicenseDurationType } from '@contracts/has-license-duration-type';
import { CaseTypes } from '@app/enums/case-types.enum';
import { mixinLicenseDurationType } from "@app/mixins/mixin-license-duration";
import { Validators } from "@angular/forms";
import { FactoryService } from "@services/factory.service";
import { InterceptModel } from "@decorators/intercept-model";
import { EmploymentInterceptor } from "@model-interceptors/employment-interceptor";
import { EmploymentService } from "@services/employment.service";
import { CaseModel } from "@app/models/case-model";
import { HasRequestType } from "@app/interfaces/has-request-type";
import { mixinRequestType } from "@app/mixins/mixin-request-type";
import { CaseModelContract } from "@contracts/case-model-contract";
import { DialogRef } from '@app/shared/models/dialog-ref';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { AdminResult } from './admin-result';
import { ObjectUtils } from '@app/helpers/object-utils';

const _RequestType = mixinLicenseDurationType(mixinRequestType(CaseModel));
const interceptor = new EmploymentInterceptor();

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive,
})
export class Employment
  extends _RequestType<EmploymentService, Employment>
  implements HasRequestType, HasLicenseDurationType, CaseModelContract<EmploymentService, Employment>,IAuditModelProperties<Employment> {
  service!: EmploymentService;
  caseType: number = CaseTypes.EMPLOYMENT;
  requestType!: number;
  category!: number;
  description: string = "";
  employeeInfoDTOs: Partial<Employee>[] = [];
  exportedLicenseId!: string;
  subject!: string;
  oldLicenseId!: string;
  oldLicenseSerial!: number;
  oldLicenseFullSerial!: string;
  licenseStartDate!: string | IMyDateModel;
  licenseEndDate!: string | IMyDateModel;
  searchFields: ISearchFieldsMap<Employment> = {
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['caseStatusInfo', 'requestTypeInfo', 'creatorInfo']),
    ...normalSearchFields(['fullSerial', 'subject'])
  };
  constructor() {
    super();
    this.service = FactoryService.getService("EmploymentService");
    this.finalizeSearchFields();
  }
  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }

  formBuilder(controls?: boolean) {
    const values = ObjectUtils.getControlValues<Employment>(this.getBasicInfoValuesWithLabels());
    return {
      requestType: controls ? [values.requestType, Validators.required] : values.requestType,
      category: controls ? [values.category, Validators.required] : values.category,
      description: controls ? [values.description] : values.description
    };
  }
  intirmDateFormBuilder() {
    const { licenseStartDate, licenseEndDate } = this;
    return {
      licenseStartDate: [licenseStartDate, !this.isApproval() || this.isCancelRequestType() ? [] : Validators.required],
      licenseEndDate: [licenseEndDate, !this.isInterm() || !this.isApproval() || this.isCancelRequestType()],
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
    // return this.employeeInfoDTOs[0].contractType == ContractTypes.Interim
    return true;
  }
  getEmployees():Employee[]{
    return this.employeeInfoDTOs as Employee[]
  }
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  getBasicInfoValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      requestType: {langKey: 'request_type', value: this.requestType},
      category:{langKey: 'main_category', value: this.category},
      description:{langKey: 'special_explanations', value: this.description},
    };
  }
  getAdminResultByProperty(property: keyof Employment): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'requestType':
        adminResultValue = this.requestTypeInfo;
        break;
      case 'caseStatus':
        adminResultValue = this.caseStatusInfo;
        break;

      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({arName: value as string, enName: value as string});
    }
    return adminResultValue ?? new AdminResult();
  }
}
