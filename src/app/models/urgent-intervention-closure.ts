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

const { send, receive } = new UrgentInterventionClosureInterceptor();

@InterceptModel({ send, receive })
export class UrgentInterventionClosure extends LicenseApprovalModel<UrgentInterventionClosureService, UrgentInterventionClosure> {
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
    };
  }
  getBasicFormFields(controls?: boolean) {
    const {
      requestType,
      fullName,
      year,
      duration,
      oldLicenseFullSerial,
      beneficiaryCountry,
      beneficiaryRegion,
      executionCountry,
      executionRegion,
      projectDescription,
      description,
    } = this;

    return {
      requestType: controls ? [requestType, [CustomValidators.required]] : requestType,
      fullName: controls ? [fullName, [CustomValidators.required, CustomValidators.maxLength(100)]] : fullName,
      year: controls ? [year, [CustomValidators.required, CustomValidators.minLength(4), CustomValidators.maxLength(4), Validators.max(new Date().getFullYear())]] : year,
      duration: controls ? [duration, [CustomValidators.required, CustomValidators.number, Validators.max(30)]] : duration,
      oldLicenseFullSerial: controls ? [oldLicenseFullSerial, [CustomValidators.maxLength(250)]] : oldLicenseFullSerial, // always required as request type is only NEW
      beneficiaryCountry: controls ? [beneficiaryCountry, [CustomValidators.required]] : beneficiaryCountry,
      beneficiaryRegion: controls ? [beneficiaryRegion, [CustomValidators.maxLength(50)]] : beneficiaryRegion,
      executionCountry: controls ? [executionCountry, [CustomValidators.required]] : executionCountry,
      executionRegion: controls ? [executionRegion, [CustomValidators.required, CustomValidators.maxLength(50)]] : executionRegion,
      projectDescription: controls ? [projectDescription, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : projectDescription,
      description: controls ? [description, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : description,
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
    const {
      directFemaleBeneficiaries,
      directMaleBeneficiaries,
      indirectFemaleBeneficiaries,
      indirectMaleBeneficiaries,
      handicappedFemaleBeneficiary,
      handicappedMaleBeneficiary,
    } = this;
    return {
      directFemaleBeneficiaries: controls ? [directFemaleBeneficiaries, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(20)]] : directFemaleBeneficiaries,
      directMaleBeneficiaries: controls ? [directMaleBeneficiaries, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(20)]] : directMaleBeneficiaries,
      indirectFemaleBeneficiaries: controls ? [indirectFemaleBeneficiaries, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(20)]] : indirectFemaleBeneficiaries,
      indirectMaleBeneficiaries: controls ? [indirectMaleBeneficiaries, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(20)]] : indirectMaleBeneficiaries,
      handicappedFemaleBeneficiary: controls ? [handicappedFemaleBeneficiary, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(20)]] : handicappedFemaleBeneficiary,
      handicappedMaleBeneficiary: controls ? [handicappedMaleBeneficiary, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(20)]] : handicappedMaleBeneficiary,
    }
  }

  getBeneficiaryByAgeFields(controls?: boolean) {
    const {
      beneficiaries0to5,
      beneficiaries5to18,
      beneficiaries19to60,
      beneficiariesOver60
    } = this;
    return {
      beneficiaries0to5: controls ? [beneficiaries0to5, [CustomValidators.required, CustomValidators.number]] : beneficiaries0to5,
      beneficiaries5to18: controls ? [beneficiaries5to18, [CustomValidators.required, CustomValidators.number]] : beneficiaries5to18,
      beneficiaries19to60: controls ? [beneficiaries19to60, [CustomValidators.required, CustomValidators.number]] : beneficiaries19to60,
      beneficiariesOver60: controls ? [beneficiariesOver60, [CustomValidators.required, CustomValidators.number]] : beneficiariesOver60
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
