import {ControlValueLabelLangKey} from './../types/types';
import {UrgentInterventionLicensingService} from '@app/services/urgent-intervention-licensing.service';
import {CaseTypes} from '@app/enums/case-types.enum';
import {FactoryService} from '@app/services/factory.service';
import {ISearchFieldsMap} from '@app/types/types';
import {dateSearchFields} from '@app/helpers/date-search-fields';
import {infoSearchFields} from '@app/helpers/info-search-fields';
import {normalSearchFields} from '@app/helpers/normal-search-fields';
import {CustomValidators} from '@app/validators/custom-validators';
import {DomainTypes} from '@app/enums/domain-types';
import {LookupService} from '@app/services/lookup.service';
import {AdminResult} from '@app/models/admin-result';
import {LangService} from '@app/services/lang.service';
import {Validators} from '@angular/forms';
import {EmployeeService} from '@app/services/employee.service';
import {CaseModel} from "@app/models/case-model";
import {mixinApprovalLicenseWithMonthly} from "@app/mixins/mixin-approval-license-with-monthly";
import {HasLicenseApprovalMonthly} from "@app/interfaces/has-license-approval-monthly";
import {mixinRequestType} from "@app/mixins/mixin-request-type";
import {HasRequestType} from "@app/interfaces/has-request-type";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {WFResponseType} from "@app/enums/wfresponse-type.enum";
import {CurrencyEnum} from "@app/enums/currency-enum";
import {isValidAdminResult} from "@app/helpers/utils";
import {DateUtils} from '@app/helpers/date-utils';
import {InterceptModel} from '@app/decorators/decorators/intercept-model';
import {UrgentInterventionLicenseInterceptor} from "@app/model-interceptors/urgent-intervention-license-interceptor";
import {CommonUtils} from '@app/helpers/common-utils';
import {AuditOperationTypes} from '@app/enums/audit-operation-types';
import {ObjectUtils} from '@app/helpers/object-utils';
import {IAuditModelProperties} from '@app/interfaces/i-audit-model-properties';
import {ILanguageKeys} from "@contracts/i-language-keys";

const _ApprovalLicenseWithMonthly = mixinRequestType(mixinApprovalLicenseWithMonthly(CaseModel))
const {send, receive} = new UrgentInterventionLicenseInterceptor();

@InterceptModel({send, receive})
export class UrgentInterventionLicense extends _ApprovalLicenseWithMonthly<UrgentInterventionLicensingService, UrgentInterventionLicense> implements IAuditModelProperties<UrgentInterventionLicense>, HasLicenseApprovalMonthly, HasRequestType {
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  caseType: number = CaseTypes.URGENT_INTERVENTION_LICENSING;
  domain: number = DomainTypes.HUMANITARIAN; // fixed value, so info will also be fixed always
  licenseDuration: number = 12; // fixed value
  currency: number = CurrencyEnum.UNITED_STATE_DOLLAR; // fixed value
  serviceSteps: string[] = [];
  organizationId!: number;
  accountNumber!: string;
  arName!: string;
  bankName!: string;
  description!: string;
  enName!: string;
  expectedResults!: string;
  goals!: string;
  licenseVSID!: string;
  mainUNOCHACategory!: number;
  outputs!: string;
  subject!: string;
  successItems!: string;
  targetAmount!: number;
  year!: number;
  inRenewalPeriod: boolean = false;
  chiefDecision?: number;
  chiefJustification: string = '';
  generalManagerDecision?: number;
  generalManagerJustification: string = '';
  managerDecision?: number;
  managerJustification: string = '';
  reviewerDepartmentDecision?: number;
  reviewerDepartmentJustification: string = '';
  secondSpecialistDecision?: number;
  secondSpecialistJustification: string = '';
  specialistDecision?: number;
  specialistJustification: string = '';
  managerDecisionInfo!: AdminResult;
  reviewerDepartmentDecisionInfo!: AdminResult;
  licenseStatusInfo!: AdminResult;
  specialistDecisionInfo!: AdminResult;
  secondSpecialistDecisionInfo!: AdminResult;
  chiefDecisionInfo!: AdminResult;
  generalManagerDecisionInfo!: AdminResult;
  domainInfo!: AdminResult;
  mainUNOCHAInfo!: AdminResult;
  currencyInfo!: AdminResult;
  iBan!: string;

  // extra services
  service: UrgentInterventionLicensingService;
  langService: LangService;
  employeeService: EmployeeService;
  projectNameInfo!: AdminResult;
  licenseStartDateString: string = '';
  licenseStartDateTimestamp?: number | null;

  searchFields: ISearchFieldsMap<UrgentInterventionLicense> = {
    ...infoSearchFields(['caseStatusInfo', 'projectNameInfo', 'ouInfo']),
    ...normalSearchFields(['requestTypeInfo', 'fullSerial', 'subject']),
    ...dateSearchFields(['createdOn'])
  }

  constructor() {
    super();
    this.service = FactoryService.getService('UrgentInterventionLicensingService');
    this.langService = FactoryService.getService('LangService');
    this.employeeService = FactoryService.getService('EmployeeService');
    this.domainInfo = this.getDomainInfo();
    this.currencyInfo = this.getCurrencyInfo();
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
      requestType: {langKey: 'request_type', value: this.requestType},
      arName: {langKey: 'arabic_name', value: this.arName},
      enName: {langKey: 'english_name', value: this.enName},
      year: {langKey: 'year', value: this.year},
      oldLicenseFullSerial: {langKey: 'license_number', value: this.oldLicenseFullSerial},
      oldLicenseId: {langKey: {} as keyof ILanguageKeys, value: this.oldLicenseId, skipAuditComparison: true},
      oldLicenseSerial: {langKey: {} as keyof ILanguageKeys, value: this.oldLicenseSerial, skipAuditComparison: true},
      domain: {langKey: 'domain', value: this.domain},
      mainUNOCHACategory: {langKey: 'main_unocha_category', value: this.mainUNOCHACategory},
    };
  }

  getBasicFormFields(control: boolean = false): any {
    const values = ObjectUtils.getControlValues<UrgentInterventionLicense>(this.getBasicInfoValuesWithLabels())

    return {
      arName: control ? [{
        value: values.arName,
        disabled: true
      }, [CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX)]] : values.arName,
      enName: control ? [{
        value: values.enName,
        disabled: true
      }, [CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : values.enName,
      requestType: control ? [values.requestType, [CustomValidators.required]] : values.requestType,
      year: control ? [{
        value: values.enName,
        disabled: true
      }, [CustomValidators.number, CustomValidators.maxLength(4)]] : values.year,
      oldLicenseFullSerial: control ? [values.oldLicenseFullSerial, [CustomValidators.maxLength(250)]] : values.oldLicenseFullSerial,
      oldLicenseId: control ? [values.oldLicenseId] : values.oldLicenseId,
      oldLicenseSerial: control ? [values.oldLicenseSerial] : values.oldLicenseSerial,
      domain: control ? [values.domain, CustomValidators.required] : values.domain,
      mainUNOCHACategory: control ? [values.mainUNOCHACategory] : values.mainUNOCHACategory
    }
  }

  getEmergencyFundValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      deductionPercent: {langKey: 'deduction_ratio', value: this.deductionPercent},
      accountNumber: {langKey: 'account_number', value: this.accountNumber},
      iBan: {langKey: 'iban', value: this.iBan},
      currency: {langKey: 'currency', value: this.currency},
      targetAmount: {langKey: 'target_cost', value: this.targetAmount},
      bankName: {langKey: 'bank_name', value: this.bankName},
      licenseDuration: {
        langKey: 'license_duration', value: this.licenseDuration,
        label: () => {
          return this.langService.map.license_duration + ' (' + this.langService.map.months + ')';
        }
      },
      licenseStartDate: {langKey: 'license_start_date', value: this.licenseStartDate, comparisonValue: this.licenseStartDateTimestamp},
    };
  }

  getEmergencyFundFields(control: boolean = false): any {
    const values = ObjectUtils.getControlValues<UrgentInterventionLicense>(this.getEmergencyFundValuesWithLabels())

    return {
      bankName: control ? [values.bankName, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : values.bankName,
      deductionPercent: control ? [values.deductionPercent, [CustomValidators.required, CustomValidators.decimal(2), Validators.min(0), Validators.max(100)]] : values.deductionPercent,
      accountNumber: control ? [values.accountNumber, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.NUMBERS_MAXLENGTH)]] : values.accountNumber,
      iBan: control ? [values.iBan, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.NUMBERS_MAXLENGTH)]] : values.iBan,
      currency: control ? [{values: values.currency, disabled: true}] : values.currency,
      targetAmount: control ? [values.targetAmount, [CustomValidators.required, CustomValidators.decimal(2)]] : values.targetAmount,
      licenseDuration: control ? [{value: values.licenseDuration, disabled: true}] : values.licenseDuration,
      licenseStartDate: control ? [{
        value: DateUtils.changeDateToDatepicker(values.licenseStartDate),
        disabled: true
      }] : DateUtils.changeDateToDatepicker(values.licenseStartDate)
    }
  }

  getProjectSummaryValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      goals: {langKey: 'project_goals', value: this.goals},
      successItems: {langKey: 'project_success_items', value: this.successItems},
      outputs: {langKey: 'project_outputs', value: this.outputs},
      expectedResults: {langKey: 'project_expected_results', value: this.expectedResults},
    };
  }

  getProjectSummaryFields(control: boolean = false): any {
    const values = ObjectUtils.getControlValues<UrgentInterventionLicense>(this.getProjectSummaryValuesWithLabels())


    return {
      goals: control ? [values.goals, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.goals,
      outputs: control ? [values.outputs, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.outputs,
      successItems: control ? [values.successItems, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.successItems,
      expectedResults: control ? [values.expectedResults, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.expectedResults,
    }
  }

  getExplanationValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      description: {langKey: 'special_explanations', value: this.description},
    }
  }

  buildSpecialInfo(controls: boolean = false) {
    const values = ObjectUtils.getControlValues<UrgentInterventionLicense>(this.getExplanationValuesWithLabels())
    return controls ? [values.description, [CustomValidators.required]] : values.description
  }

  getDomainInfo(): AdminResult {
    if (this.domainInfo && isValidAdminResult(this.domainInfo)) {
      return this.domainInfo;
    }

    let lookupService: LookupService = FactoryService.getService('LookupService'),
      lookup = lookupService.listByCategory.Domain.find(x => x.lookupKey === this.domain);
    return AdminResult.createInstance(!lookup ? {} : {
      arName: lookup.arName,
      enName: lookup.enName
    });
  }

  getCurrencyInfo(): AdminResult {
    if (this.currencyInfo && isValidAdminResult(this.currencyInfo)) {
      return this.currencyInfo;
    }

    let lookupService: LookupService = FactoryService.getService('LookupService'),
      lookup = lookupService.listByCategory.Currency.find(x => x.lookupKey === this.currency);
    return AdminResult.createInstance(!lookup ? {} : {
      arName: lookup.arName,
      enName: lookup.enName
    });
  }


  approve(): DialogRef {
    return this.service.approveTask(this, WFResponseType.APPROVE);
  }

  finalApprove(): DialogRef {
    return this.service.approveTask(this, WFResponseType.FINAL_APPROVE);
  }

  getAdminResultByProperty(property: keyof UrgentInterventionLicense): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'caseStatus':
        adminResultValue = this.caseStatusInfo;
        break;
      case 'managerDecision':
        adminResultValue = this.managerDecisionInfo;
        break;
      case 'requestType':
        adminResultValue = this.requestTypeInfo;
        break;
      case 'reviewerDepartmentDecision':
        adminResultValue = this.reviewerDepartmentDecisionInfo;
        break;
      case 'specialistDecision':
        adminResultValue = this.specialistDecisionInfo;
        break;
      case 'secondSpecialistDecision':
        adminResultValue = this.secondSpecialistDecisionInfo;
        break;
      case 'chiefDecision':
        adminResultValue = this.chiefDecisionInfo;
        break;
      case 'generalManagerDecision':
        adminResultValue = this.generalManagerDecisionInfo;
        break;
      case 'domain':
        adminResultValue = this.domainInfo;
        break;
      case 'mainUNOCHACategory':
        adminResultValue = this.mainUNOCHAInfo;
        break;
      case 'currency':
        adminResultValue = this.currencyInfo;
        break;
      case 'licenseStartDate':
        const licenseStartDate = DateUtils.getDateStringFromDate(this.licenseStartDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({arName: licenseStartDate, enName: licenseStartDate});
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
