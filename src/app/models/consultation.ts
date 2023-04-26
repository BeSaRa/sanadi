import { CaseModel } from './case-model';
import { ConsultationService } from '@services/consultation.service';
import { FactoryService } from '@services/factory.service';
import { CustomValidators } from '../validators/custom-validators';
import { AdminResult } from './admin-result';
import { ControlValueLabelLangKey, ISearchFieldsMap } from "@app/types/types";
import { dateSearchFields } from "@app/helpers/date-search-fields";
import { infoSearchFields } from "@app/helpers/info-search-fields";
import { normalSearchFields } from "@app/helpers/normal-search-fields";
import { InterceptModel } from "@decorators/intercept-model";
import { ConsultationInterceptor } from "@app/model-interceptors/consultation-interceptor";
import { CaseTypes } from "@app/enums/case-types.enum";
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';

const interceptor = new ConsultationInterceptor()

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive
})
export class Consultation extends CaseModel<ConsultationService, Consultation> implements IAuditModelProperties<Consultation> {
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  caseType: number = CaseTypes.CONSULTATION;
  category!: number;
  email!: string;
  fullName!: string;
  mobileNo!: string;
  requestBody!: string;
  organizationInfo!: AdminResult;
  categoryInfo!: AdminResult;
  service: ConsultationService;
  searchFields: ISearchFieldsMap<Consultation> = {
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['creatorInfo', 'caseStatusInfo', 'organizationInfo', 'categoryInfo']),
    ...normalSearchFields(['fullName', 'fullSerial'])
  }

  constructor() {
    super();
    this.service = FactoryService.getService('ConsultationService');
    this.finalizeSearchFields();
  }

  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }
  getBasicInfoValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      category: { langKey: 'consulting_type', value: this.category },
      organizationId: { langKey: 'lbl_organization', value: this.organizationId },
      fullName: { langKey: 'full_name', value: this.fullName },
      email: { langKey: 'lbl_email', value: this.email },
      mobileNo: { langKey: 'lbl_phone', value: this.mobileNo },
      requestBody: { langKey: 'request_body', value: this.requestBody },
      competentDepartmentID: { langKey: 'competent_dep', value: this.competentDepartmentID }
    };
  }
  getFormFields(control: boolean = false): any {
    const {
      category,
      organizationId,
      fullName,
      mobileNo,
      email,
      requestBody,
      competentDepartmentID,
      competentDepartmentAuthName
    } = this;

    return {
      category: control ? [category, [CustomValidators.required]] : category,
      organizationId: control ? [organizationId, [CustomValidators.required]] : organizationId,
      fullName: control ? [fullName, [CustomValidators.required,
      CustomValidators.minLength(4),
      CustomValidators.maxLength(100),
      CustomValidators.pattern('ENG_AR_NUM_ONLY')]] : fullName,
      mobileNo: control ? [mobileNo, [CustomValidators.required].concat(CustomValidators.commonValidations.mobileNo)] : mobileNo,
      email: control ? [email, [CustomValidators.required, CustomValidators.maxLength(50), CustomValidators.pattern('EMAIL')]] : email,
      requestBody: control ? [requestBody, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : requestBody,
      competentDepartmentID: control ? [competentDepartmentID] : competentDepartmentID,
      competentDepartmentAuthName: control ? [competentDepartmentAuthName] : competentDepartmentAuthName
    };
  }

  getAdminResultByProperty(property: keyof Consultation): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'category':
        adminResultValue = this.categoryInfo;
        break;
      case 'organizationId':
        adminResultValue = this.ouInfo;
        break;
      case 'caseStatus':
        adminResultValue = this.caseStatusInfo;
        break;

      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({ arName: value as string, enName: value as string });
    }
    return adminResultValue ?? new AdminResult();
  }
}
