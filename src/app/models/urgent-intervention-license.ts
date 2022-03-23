import {LicenseApprovalModel} from '@app/models/license-approval-model';
import {UrgentInterventionLicensingService} from '@app/services/urgent-intervention-licensing.service';
import {CaseTypes} from '@app/enums/case-types.enum';
import {FactoryService} from '@app/services/factory.service';
import {ISearchFieldsMap} from '@app/types/types';
import {dateSearchFields} from '@app/helpers/date-search-fields';
import {infoSearchFields} from '@app/helpers/info-search-fields';
import {normalSearchFields} from '@app/helpers/normal-search-fields';
import {CustomValidators} from '@app/validators/custom-validators';
import {Domains} from '@app/enums/domains.enum';
import {Lookup} from '@app/models/lookup';
import {LookupService} from '@app/services/lookup.service';
import {TaskDetails} from '@app/models/task-details';
import {AdminResult} from '@app/models/admin-result';
import {LangService} from '@app/services/lang.service';
import {Validators} from '@angular/forms';
import {EmployeeService} from '@app/services/employee.service';

export class UrgentInterventionLicense extends LicenseApprovalModel<UrgentInterventionLicensingService, UrgentInterventionLicense> {
  caseType: number = CaseTypes.URGENT_INTERVENTION_LICENSING;
  domain: number = Domains.HUMAN; // fixed value, so info will also be fixed always
  serviceSteps: string[] = [];
  organizationId!: number;
  accountNumber!: string;
  arName!: string;
  bankName!: string;
  currency!: number;
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
    ...normalSearchFields(['fullSerial']),
    ...dateSearchFields(['createdOn'])
  }

  constructor() {
    super();
    this.service = FactoryService.getService('UrgentInterventionLicensingService');
    this.langService = FactoryService.getService('LangService');
    this.employeeService = FactoryService.getService('EmployeeService');
    this.domainInfo = this.getDomainInfo();
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
      year: control ? [year, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(4)]] : year,
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
    let lookupService: LookupService = FactoryService.getService('LookupService'),
      lookup = lookupService.listByCategory.Domain.find(x => x.lookupKey === this.domain);
    return AdminResult.createInstance(!lookup ? {} : {
      arName: lookup.arName,
      enName: lookup.enName
    });
  }
}
