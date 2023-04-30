import { FinalExternalOfficeApprovalService } from '@services/final-external-office-approval.service';
import { FactoryService } from '@services/factory.service';
import { BankAccount } from './bank-account';
import { BankBranch } from './bank-branch';
import { ExecutiveManagement } from './executive-management';
import { CustomValidators } from '@app/validators/custom-validators';
import { Validators } from '@angular/forms';
import { LicenseApprovalModel } from '@app/models/license-approval-model';
import { DateUtils } from '@app/helpers/date-utils';
import { AdminResult } from '@app/models/admin-result';
import { CaseTypes } from '@app/enums/case-types.enum';
import { ControlValueLabelLangKey, ISearchFieldsMap } from "@app/types/types";
import { dateSearchFields } from "@app/helpers/date-search-fields";
import { infoSearchFields } from "@app/helpers/info-search-fields";
import { normalSearchFields } from "@app/helpers/normal-search-fields";
import {
  FinalExternalOfficeApprovalInterceptor
} from '@app/model-interceptors/final-external-office-approval-interceptor';
import { InterceptModel } from "@decorators/intercept-model";
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import { CommonUtils } from '@app/helpers/common-utils';
import { ObjectUtils } from '@app/helpers/object-utils';


const { send, receive } = new FinalExternalOfficeApprovalInterceptor();

@InterceptModel({ send, receive })
export class FinalExternalOfficeApproval extends LicenseApprovalModel<FinalExternalOfficeApprovalService, FinalExternalOfficeApproval> implements IAuditModelProperties<FinalExternalOfficeApproval> {
  caseType: number = CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL;
  requestType!: number;
  organizationId!: number;
  subject: string = '';
  actionType!: number;
  country!: number;
  region!: string;
  description: string = '';
  specialistJustification: string = '';
  chiefJustification: string = '';
  managerJustification: string = '';
  reviewerDepartmentJustification: string = '';
  specialistDecision?: number;
  chiefDecision?: number;
  managerDecision?: number;
  reviewerDepartmentDecision?: number;
  establishmentDate: string = '';
  establishmentDateTimeStamp!: number|null;
  address: string = '';
  email: string = '';
  externalOfficeName: string = '';
  fax: string = '';
  phone: string = '';
  postalCode: string = '';
  recordNo: string = '';
  headQuarterType!: number;
  licenseDuration!: number;
  licenseDurationType!: number;
  countries: number[] = [];
  countriesInfo: AdminResult[] = [];


  executiveManagementList: ExecutiveManagement[] = [];
  branchList: BankBranch[] = [];
  bankAccountList: BankAccount[] = [];

  specialistDecisionInfo!: AdminResult;
  chiefDecisionInfo!: AdminResult;
  managerDecisionInfo!: AdminResult;
  generalManagerDecisionInfo!: AdminResult;
  reviewerDepartmentDecisionInfo!: AdminResult;
  licenseStatusInfo!: AdminResult;
  headQuarterTypeInfo!: AdminResult;
  countryInfo!: AdminResult;
  licenseDurationTypeInfo!: AdminResult;

  service: FinalExternalOfficeApprovalService;

  searchFields: ISearchFieldsMap<FinalExternalOfficeApproval> = {
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['requestTypeInfo', 'creatorInfo', 'caseStatusInfo', 'ouInfo']),
    ...normalSearchFields(['subject', 'fullSerial'])
  }

  constructor() {
    super();
    this.service = FactoryService.getService('FinalExternalOfficeApprovalService');
    this.finalizeSearchFields();
  }

  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  getBasicInfoValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      requestType: {langKey: 'request_type', value: this.requestType},
      oldLicenseFullSerial:{langKey: 'license_number', value: this.oldLicenseFullSerial},
      oldLicenseId:{langKey: 'license_number', value: this.oldLicenseId},
      oldLicenseSerial:{langKey: 'serial_number', value: this.oldLicenseSerial},
      country:{langKey: 'country', value: this.country},
      region:{langKey: 'region', value: this.region},
      externalOfficeName:{langKey: 'external_office_name', value: this.externalOfficeName},
      establishmentDate:{langKey: 'establishment_date', value: this.establishmentDate,comparisonValue: this.establishmentDateTimeStamp},
      recordNo:{langKey: 'record_number', value: this.recordNo},
      address:{langKey: 'lbl_address', value: this.address},
      phone:{langKey: 'lbl_phone', value: this.phone},
      fax:{langKey: 'fax_number', value: this.fax},
      postalCode:{langKey: 'postal_code', value: this.postalCode},
      email:{langKey: 'lbl_email', value: this.email},
      description:{langKey: 'special_explanations', value: this.description},
      headQuarterType:{langKey: 'office_type', value: this.headQuarterType},
      licenseDuration:{langKey: 'license_duration', value: this.licenseDuration},
      licenseDurationType:{langKey: 'license_duration_type', value: this.licenseDurationType},
      countries:{langKey: 'states', value: this.countries}
    };
  }
  getFormFields(control: boolean = false): any {
    const values = ObjectUtils.getControlValues<FinalExternalOfficeApproval>(this.getBasicInfoValuesWithLabels());

    return {
      requestType: control ? [values.requestType, [CustomValidators.required]] : values.requestType,
      oldLicenseFullSerial: control ? [values.oldLicenseFullSerial, [CustomValidators.maxLength(250)]] : values.oldLicenseFullSerial,
      oldLicenseId: control ? [values.oldLicenseId] : values.oldLicenseId,
      oldLicenseSerial: control ? [values.oldLicenseSerial] : values.oldLicenseSerial,
      country: control ? [values.country, [CustomValidators.required]] : values.country,
      region: control ? [values.region, [CustomValidators.maxLength(50)]] : values.region,//state
      externalOfficeName: control ? [values.externalOfficeName, [CustomValidators.required, CustomValidators.maxLength(100)]] : values.externalOfficeName,
      establishmentDate: control ? [DateUtils.changeDateToDatepicker(values.establishmentDate), [CustomValidators.maxDate(new Date())]] : DateUtils.changeDateToDatepicker(values.establishmentDate),
      recordNo: control ? [values.recordNo, [CustomValidators.maxLength(20)]] : values.recordNo,
      address: control ? [values.address, [CustomValidators.maxLength(100)]] : values.address,
      phone: control ? [values.phone, CustomValidators.commonValidations.phone] : values.phone,
      fax: control ? [values.fax, CustomValidators.commonValidations.fax] : values.fax,
      postalCode: control ? [values.postalCode, [CustomValidators.number, Validators.maxLength(10)]] : values.postalCode,
      email: control ? [values.email, [CustomValidators.pattern('EMAIL'), CustomValidators.maxLength(100)]] : values.email,
      description: control ? [values.description, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.description,
      headQuarterType: control ? [values.headQuarterType, [CustomValidators.required]] : values.headQuarterType,
      licenseDuration: control ? [values.licenseDuration] : values.licenseDuration,
      licenseDurationType: control ? [values.licenseDurationType, [CustomValidators.required]] : values.licenseDurationType,
      countries: control ? [values.countries] : values.countries
    }
  }
  getAdminResultByProperty(property: keyof FinalExternalOfficeApproval): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'requestType':
        adminResultValue = this.requestTypeInfo;
        break;
      case 'caseStatus':
        adminResultValue = this.caseStatusInfo;
        break;
      case 'headQuarterType':
        adminResultValue = this.headQuarterTypeInfo;
        break;
      case 'country':
        adminResultValue = this.countryInfo;
        break;
      case 'licenseDurationType':
        adminResultValue = this.licenseDurationTypeInfo;
        break;
      case 'establishmentDate':
        const dateValue = DateUtils.getDateStringFromDate(this.establishmentDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({arName: dateValue, enName: dateValue});
        break;
      case 'countries':
        const countriesValue = this.countriesInfo.filter(x=>this.countries.includes(x.id!)).map(x=>x.getName()).toString();
        adminResultValue = AdminResult.createInstance({arName: countriesValue, enName: countriesValue});
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
