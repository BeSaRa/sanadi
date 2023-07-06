import {CaseModel} from './case-model';
import {FactoryService} from '@services/factory.service';
import {CustomValidators} from '../validators/custom-validators';
import {InternationalCooperationService} from '@services/international-cooperation.service';
import {CaseTypes} from '@app/enums/case-types.enum';
import {ControlValueLabelLangKey, ISearchFieldsMap} from '@app/types/types';
import {dateSearchFields} from '@app/helpers/date-search-fields';
import {infoSearchFields} from '@app/helpers/info-search-fields';
import {normalSearchFields} from '@app/helpers/normal-search-fields';
import {IAuditModelProperties} from '@app/interfaces/i-audit-model-properties';
import {AuditOperationTypes} from '@app/enums/audit-operation-types';
import {CommonUtils} from '@app/helpers/common-utils';
import {AdminResult} from './admin-result';

export class InternationalCooperation extends CaseModel<InternationalCooperationService, InternationalCooperation> implements IAuditModelProperties<InternationalCooperation> {
  caseType: number = CaseTypes.INTERNATIONAL_COOPERATION;
  country!: string;
  email!: string;
  fullName!: string;
  mobileNo!: string;
  organization!: string;
  requestBody!: string;
  service: InternationalCooperationService;

  countryInfo!: AdminResult;

  searchFields: ISearchFieldsMap<InternationalCooperation> = {
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['creatorInfo', 'caseStatusInfo']),
    ...normalSearchFields(['fullSerial', 'organization', 'fullName'])
  }

  constructor() {
    super();
    this.service = FactoryService.getService('InternationalCooperationService');
    this.finalizeSearchFields();
  }

  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }

  getAdminResultByProperty(property: keyof InternationalCooperation): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'caseStatus':
        adminResultValue = this.caseStatusInfo;
        break;
      case 'country':
        adminResultValue = this.countryInfo;
        break;
      case 'competentDepartmentID':
        adminResultValue = this.service.departments.find(x => x.id === this.competentDepartmentID)?.createAdminResult() ?? new AdminResult();
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

  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  getBasicInfoValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      country: {langKey: 'country', value: this.country},
      email: {langKey: 'lbl_email', value: this.email},
      fullName: {langKey: 'full_name', value: this.fullName},
      mobileNo: {langKey: 'mobile_number', value: this.mobileNo},
      organization: {langKey: 'lbl_organization', value: this.organization},
      requestBody: {langKey: 'request_body', value: this.requestBody},
      competentDepartmentID: {langKey: 'competent_dep', value: this.competentDepartmentID},
      competentDepartmentAuthName: {langKey: 'department', value: this.competentDepartmentAuthName}
    }
  }

  getFormFields(controls: boolean = false): any {
    const {
      country,
      email,
      fullName,
      mobileNo,
      organization,
      requestBody,
      competentDepartmentID,
      competentDepartmentAuthName
    } = this;

    return {
      country: controls ? [country, [CustomValidators.required]] : country,
      email: controls ? [email, [CustomValidators.required, CustomValidators.maxLength(50), CustomValidators.pattern('EMAIL')]] : email,
      fullName: controls ? [fullName, [CustomValidators.required,
        CustomValidators.minLength(4),
        CustomValidators.maxLength(100),
        CustomValidators.pattern('ENG_AR_ONLY')]] : fullName,
      mobileNo: controls ? [mobileNo, [CustomValidators.required].concat(CustomValidators.commonValidations.mobileNo)] : mobileNo,
      organization: controls ? [organization, [CustomValidators.maxLength(100)]] : organization,
      requestBody: controls ? [requestBody, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : requestBody,
      competentDepartmentID: controls ? [competentDepartmentID, [CustomValidators.required]] : competentDepartmentID,
      competentDepartmentAuthName: controls ? [competentDepartmentAuthName, [CustomValidators.required]] : competentDepartmentAuthName
    };
  }
}
