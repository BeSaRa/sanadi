import { ControlValueLabelLangKey } from './../types/types';
import { ISearchFieldsMap } from '@app/types/types';
import { dateSearchFields } from '@helpers/date-search-fields';
import { infoSearchFields } from '@helpers/info-search-fields';
import { normalSearchFields } from '@helpers/normal-search-fields';
import { FactoryService } from '@services/factory.service';
import { LangService } from '@services/lang.service';
import { EmployeeService } from '@services/employee.service';
import { UrgentInterventionClosureService } from '@services/urgent-intervention-closure.service';
import { AdminResult } from '@app/models/admin-result';
import { ImplementingAgency } from '@app/models/implementing-agency';
import { InterventionRegion } from '@app/models/intervention-region';
import { InterventionField } from '@app/models/intervention-field';
import { BestPractices } from '@app/models/best-practices';
import { LessonsLearned } from '@app/models/lessons-learned';
import { OfficeEvaluation } from '@app/models/office-evaluation';
import { Result } from '@app/models/result';
import { Stage } from '@app/models/stage';
import { CaseTypes } from '@app/enums/case-types.enum';
import { LicenseApprovalModel } from '@app/models/license-approval-model';
import { CustomValidators } from '@app/validators/custom-validators';
import { Validators } from '@angular/forms';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { InterceptModel } from "@decorators/intercept-model";
import { UrgentInterventionClosureInterceptor } from "@app/model-interceptors/urgent-intervention-closure-interceptor";
import { CommonUtils } from '@app/helpers/common-utils';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';

const { send, receive } = new UrgentInterventionClosureInterceptor();

@InterceptModel({ send, receive })
export class UrgentInterventionClosure extends LicenseApprovalModel<UrgentInterventionClosureService, UrgentInterventionClosure> implements IAuditModelProperties<UrgentInterventionClosure> {
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  caseType: number = CaseTypes.URGENT_INTERVENTION_CLOSURE;
  organizationId!: number;
  requestType!: number; //ServiceRequestTypes.NEW; (always NEW)
  subject!: string;
  fullName!: string;
  duration!: number;
  projectDescription!: string;
  beneficiaryCountry!: number;
  beneficiaryRegion!: string;
  executionCountry!: number;
  executionRegion!: string;
  handicappedFemaleBeneficiary: number = 0;
  handicappedMaleBeneficiary: number = 0;
  directMaleBeneficiaries: number = 0;
  directFemaleBeneficiaries: number = 0;
  indirectMaleBeneficiaries: number = 0;
  indirectFemaleBeneficiaries: number = 0;
  beneficiaries0to5: number = 0;
  beneficiaries5to18: number = 0;
  beneficiaries19to60: number = 0;
  beneficiariesOver60: number = 0;
  interventionTotalCost!: number;
  description!: string;
  year!: number;
  licenseVSID!: string;
  implementingAgencyList: ImplementingAgency[] = [];
  interventionRegionList: InterventionRegion[] = [];
  interventionFieldList: InterventionField[] = [];
  bestPracticesList: BestPractices[] = [];
  lessonsLearnedList: LessonsLearned[] = [];
  officeEvaluationList: OfficeEvaluation[] = [];
  resultList: Result[] = [];
  stageList: Stage[] = [];
  beneficiaryCountryInfo!: AdminResult;
  executionCountryInfo!: AdminResult;
  licenseClassName!: string;


  service: UrgentInterventionClosureService;
  langService: LangService;
  employeeService: EmployeeService;
  ignoreSendInterceptor?: boolean;

  searchFields: ISearchFieldsMap<UrgentInterventionClosure> = {
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['requestTypeInfo', 'caseStatusInfo', 'ouInfo']),
    ...normalSearchFields(['fullSerial', 'subject'])
  };

  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }

  constructor() {
    super();
    this.service = FactoryService.getService('UrgentInterventionClosureService');
    this.langService = FactoryService.getService('LangService');
    this.employeeService = FactoryService.getService('EmployeeService');
    this.finalizeSearchFields();
  }
  getBasicInfoValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      requestType: { langKey: 'request_type', value: this.requestType },
      fullName: { langKey: 'entity_name', value: this.fullName },
      year: { langKey: 'year', value: this.year },
      duration: { langKey: 'days', value: this.duration },
      oldLicenseFullSerial: { langKey: 'license_number', value: this.oldLicenseFullSerial },
      beneficiaryCountry: { langKey: 'country', value: this.beneficiaryCountry },
      beneficiaryRegion: { langKey: 'region', value: this.beneficiaryRegion },
      executionCountry: { langKey: 'country', value: this.executionCountry },
      executionRegion: { langKey: 'region', value: this.executionRegion },
      projectDescription: { langKey: 'lbl_description', value: this.projectDescription },
      description: { langKey: 'special_explanations', value: this.description },
    };
  }
  getBasicFormFields(controls?: boolean) {
    const values = ObjectUtils.getControlValues<UrgentInterventionClosure>(this.getBasicInfoValuesWithLabels())
    return {
      requestType: controls ? [values.requestType, [CustomValidators.required]] : values.requestType,
      fullName: controls ? [values.fullName, [CustomValidators.required, CustomValidators.maxLength(100)]] : values.fullName,
      year: controls ? [values.year, [CustomValidators.required, CustomValidators.minLength(4), CustomValidators.maxLength(4), Validators.max(new Date().getFullYear())]] : values.year,
      duration: controls ? [values.duration, [CustomValidators.required, CustomValidators.number, Validators.max(30)]] : values.duration,
      oldLicenseFullSerial: controls ? [values.oldLicenseFullSerial, [CustomValidators.maxLength(250)]] : values.oldLicenseFullSerial, // always required as request type is only NEW
      beneficiaryCountry: controls ? [values.beneficiaryCountry, [CustomValidators.required]] : values.beneficiaryCountry,
      beneficiaryRegion: controls ? [values.beneficiaryRegion, [CustomValidators.maxLength(50)]] : values.beneficiaryRegion,
      executionCountry: controls ? [values.executionCountry, [CustomValidators.required]] : values.executionCountry,
      executionRegion: controls ? [values.executionRegion, [CustomValidators.required, CustomValidators.maxLength(50)]] : values.executionRegion,
      projectDescription: controls ? [values.projectDescription, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.projectDescription,
      description: controls ? [values.description, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.description,
    };
  }
  getBeneficiaryAnalysisValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      directFemaleBeneficiaries: { langKey: 'female_beneficiaries_number', value: this.directFemaleBeneficiaries },
      directMaleBeneficiaries: { langKey: 'male_beneficiaries_number', value: this.directMaleBeneficiaries },
      indirectFemaleBeneficiaries: { langKey: 'female_beneficiaries_number', value: this.indirectFemaleBeneficiaries },
      indirectMaleBeneficiaries: { langKey: 'male_beneficiaries_number', value: this.indirectMaleBeneficiaries },
      handicappedFemaleBeneficiary: { langKey: 'female_beneficiaries_number', value: this.handicappedFemaleBeneficiary },
      handicappedMaleBeneficiary: { langKey: 'male_beneficiaries_number', value: this.handicappedMaleBeneficiary },
      beneficiaries0to5: { langKey: 'number_of_0_to_5', value: this.beneficiaries0to5 },
      beneficiaries5to18: { langKey: 'number_of_5_to_18', value: this.beneficiaries5to18 },
      beneficiaries19to60: { langKey: 'number_of_19_to_60', value: this.beneficiaries19to60 },
      beneficiariesOver60: { langKey: 'number_of_above_60', value: this.beneficiariesOver60 },
    };
  }
  getBeneficiaryFields(controls?: boolean) {
    const values = ObjectUtils.getControlValues<UrgentInterventionClosure>(this.getBeneficiaryAnalysisValuesWithLabels())

    return {
      directFemaleBeneficiaries: controls ? [values.directFemaleBeneficiaries, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(20)]] : values.directFemaleBeneficiaries,
      directMaleBeneficiaries: controls ? [values.directMaleBeneficiaries, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(20)]] : values.directMaleBeneficiaries,
      indirectFemaleBeneficiaries: controls ? [values.indirectFemaleBeneficiaries, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(20)]] : values.indirectFemaleBeneficiaries,
      indirectMaleBeneficiaries: controls ? [values.indirectMaleBeneficiaries, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(20)]] : values.indirectMaleBeneficiaries,
      handicappedFemaleBeneficiary: controls ? [values.handicappedFemaleBeneficiary, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(20)]] : values.handicappedFemaleBeneficiary,
      handicappedMaleBeneficiary: controls ? [values.handicappedMaleBeneficiary, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(20)]] : values.handicappedMaleBeneficiary,
    }
  }

  getBeneficiaryByAgeFields(controls?: boolean) {
    const values = ObjectUtils.getControlValues<UrgentInterventionClosure>(this.getBeneficiaryAnalysisValuesWithLabels())

    return {
      beneficiaries0to5: controls ? [values.beneficiaries0to5, [CustomValidators.required, CustomValidators.number]] : values.beneficiaries0to5,
      beneficiaries5to18: controls ? [values.beneficiaries5to18, [CustomValidators.required, CustomValidators.number]] : values.beneficiaries5to18,
      beneficiaries19to60: controls ? [values.beneficiaries19to60, [CustomValidators.required, CustomValidators.number]] : values.beneficiaries19to60,
      beneficiariesOver60: controls ? [values.beneficiariesOver60, [CustomValidators.required, CustomValidators.number]] : values.beneficiariesOver60
    };
  }

  approve(): DialogRef {
    return this.service.approveTask(this, WFResponseType.APPROVE);
  }

  finalApprove(): DialogRef {
    return this.service.approveTask(this, WFResponseType.FINAL_APPROVE);
  }
  getAdminResultByProperty(property: keyof UrgentInterventionClosure): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'beneficiaryCountry':
        adminResultValue = this.beneficiaryCountryInfo;
        break;
      case 'executionCountry':
        adminResultValue = this.executionCountryInfo;
        break;
      case 'requestType':
        adminResultValue = this.requestTypeInfo;
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
