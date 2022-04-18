import {UrgentInterventionLicensingService} from '@app/services/urgent-intervention-licensing.service';
import {CaseTypes} from '@app/enums/case-types.enum';
import {FactoryService} from '@app/services/factory.service';
import {ISearchFieldsMap} from '@app/types/types';
import {dateSearchFields} from '@app/helpers/date-search-fields';
import {infoSearchFields} from '@app/helpers/info-search-fields';
import {normalSearchFields} from '@app/helpers/normal-search-fields';
import {CustomValidators} from '@app/validators/custom-validators';
import {Domains} from '@app/enums/domains.enum';
import {LookupService} from '@app/services/lookup.service';
import {AdminResult} from '@app/models/admin-result';
import {LangService} from '@app/services/lang.service';
import {Validators} from '@angular/forms';
import {EmployeeService} from '@app/services/employee.service';
import {CaseModel} from "@app/models/case-model";
import {mixinApprovalLicenseWithMonthly} from "@app/mixins/minin-approval-license-with-monthly";
import {HasLicenseApprovalMonthly} from "@app/interfaces/has-license-approval-monthly";
import {mixinRequestType} from "@app/mixins/mixin-request-type";
import {HasRequestType} from "@app/interfaces/has-request-type";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {WFResponseType} from "@app/enums/wfresponse-type.enum";
import {CurrencyEnum} from "@app/enums/currency-enum";
import {isValidAdminResult} from "@app/helpers/utils";

const _ApprovalLicenseWithMonthly = mixinRequestType(mixinApprovalLicenseWithMonthly(CaseModel))

export class UrgentInterventionLicense extends _ApprovalLicenseWithMonthly<UrgentInterventionLicensingService, UrgentInterventionLicense> implements HasLicenseApprovalMonthly, HasRequestType {
  caseType: number = CaseTypes.URGENT_INTERVENTION_LICENSING;
  domain: number = Domains.HUMAN; // fixed value, so info will also be fixed always
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

  searchFields: ISearchFieldsMap<UrgentInterventionLicense> = {
    ...infoSearchFields(['caseStatusInfo', 'projectNameInfo', 'ouInfo']),
    ...normalSearchFields(['fullSerial', 'subject']),
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

  getBasicFormFields(control: boolean = false): any {
    const {
      requestType,
      oldLicenseFullSerial,
      oldLicenseId,
      oldLicenseSerial,
      domain,
      mainUNOCHACategory,
      year
    } = this;

    return {
      requestType: control ? [requestType, [CustomValidators.required]] : requestType,
      year: control ? [year, [CustomValidators.number, CustomValidators.maxLength(4)]] : year,
      oldLicenseFullSerial: control ? [oldLicenseFullSerial, [CustomValidators.maxLength(250)]] : oldLicenseFullSerial,
      oldLicenseId: control ? [oldLicenseId] : oldLicenseId,
      oldLicenseSerial: control ? [oldLicenseSerial] : oldLicenseSerial,
      domain: control ? [domain, CustomValidators.required] : domain,
      mainUNOCHACategory: control ? [{value: mainUNOCHACategory, disabled: true}] : mainUNOCHACategory
    }
  }

  getEmergencyFundFields(control: boolean = false): any {
    const {
      deductionPercent,
      accountNumber,
      iBan,
      currency,
      targetAmount,
      bankName,
      licenseDuration
    } = this;

    return {
      bankName: control ? [bankName, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : bankName,
      deductionPercent: control ? [deductionPercent, [CustomValidators.required, CustomValidators.decimal(2), Validators.min(0), Validators.max(100)]] : deductionPercent,
      accountNumber: control ? [accountNumber, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.SWIFT_CODE_MAX)]] : accountNumber,
      iBan: control ? [iBan, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.SWIFT_CODE_MAX)]] : iBan,
      currency: control ? [{values: currency, disabled: true}, CustomValidators.required] : currency,
      targetAmount: control ? [targetAmount, [CustomValidators.required, CustomValidators.decimal(2)]] : targetAmount,
      licenseDuration: control ? [{value: licenseDuration, disabled: true}, CustomValidators.required] : licenseDuration
    }
  }

  getProjectSummaryFields(control: boolean = false): any {
    const {
      goals,
      successItems,
      outputs,
      expectedResults
    } = this;

    return {
      goals: control ? [goals, [CustomValidators.required, CustomValidators.maxLength(1200)]] : goals,
      outputs: control ? [outputs, [CustomValidators.required, CustomValidators.maxLength(1200)]] : outputs,
      successItems: control ? [successItems, [CustomValidators.required, CustomValidators.maxLength(1200)]] : successItems,
      expectedResults: control ? [expectedResults, [CustomValidators.required, CustomValidators.maxLength(1200)]] : expectedResults,
    }
  }

  getDomainInfo(): AdminResult {
    if(this.domainInfo && isValidAdminResult(this.domainInfo)){
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
    if(this.currencyInfo && isValidAdminResult(this.currencyInfo)){
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
}
