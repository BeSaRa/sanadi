import {CaseTypes} from '@app/enums/case-types.enum';
import {LangService} from '@app/services/lang.service';
import {EmployeeService} from '@app/services/employee.service';
import {UrgentInterventionReportingService} from '@app/services/urgent-intervention-reporting.service';
import {FactoryService} from '@app/services/factory.service';
import {AdminResult} from '@app/models/admin-result';
import {ImplementingAgency} from '@app/models/implementing-agency';
import {InterventionRegion} from '@app/models/intervention-region';
import {InterventionField} from '@app/models/intervention-field';
import {ISearchFieldsMap} from '@app/types/types';
import {dateSearchFields} from '@app/helpers/date-search-fields';
import {infoSearchFields} from '@app/helpers/info-search-fields';
import {normalSearchFields} from '@app/helpers/normal-search-fields';
import {CaseModel} from '@app/models/case-model';
import {CustomValidators} from '@app/validators/custom-validators';
import {mixinRequestType} from '@app/mixins/mixin-request-type';
import {HasRequestType} from '@contracts/has-request-type';
import {UrgentInterventionClosure} from '@app/models/urgent-intervention-closure';
import {ServiceRequestTypes} from '@app/enums/service-request-types';
import {BestPractices} from '@app/models/best-practices';
import {LessonsLearned} from '@app/models/lessons-learned';
import {OfficeEvaluation} from '@app/models/office-evaluation';
import {Result} from '@app/models/result';
import {Stage} from '@app/models/stage';

const _RequestType = mixinRequestType(CaseModel);

export class UrgentInterventionReport extends _RequestType<UrgentInterventionReportingService, UrgentInterventionReport> implements HasRequestType {
  caseType: number = CaseTypes.URGENT_INTERVENTION_REPORTING;
  serviceSteps: string[] = [];
  organizationId!: number;
  // requestType!: number;
  interventionName!: string;
  projectDescription!: string;
  interventionLicenseId!: string;
  beneficiaryCountry!: number;
  beneficiaryRegion!: string;
  executionCountry!: number;
  executionRegion!: string;
  description!: string;
  licenseVSID!: string;
  oldLicenseFullSerial!: string;
  oldLicenseId!: string;
  oldLicenseSerial!: number;
  exportedLicenseFullSerial!: string;
  exportedLicenseId!: string;
  exportedLicenseSerial!: number;
  implementingAgencyList: ImplementingAgency[] = [];
  interventionRegionList: InterventionRegion[] = [];
  interventionFieldList: InterventionField[] = [];
  subject!: string;
  // requestTypeInfo!: AdminResult;
  beneficiaryCountryInfo!: AdminResult;
  executionCountryInfo!: AdminResult;

  service: UrgentInterventionReportingService;
  langService: LangService;
  employeeService: EmployeeService;

  ignoreSendInterceptor?: boolean;

  searchFields: ISearchFieldsMap<UrgentInterventionReport> = {
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['caseStatusInfo', 'ouInfo']),
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
    this.service = FactoryService.getService('UrgentInterventionReportingService');
    this.langService = FactoryService.getService('LangService');
    this.employeeService = FactoryService.getService('EmployeeService');
    this.finalizeSearchFields();
  }

  getBasicFormFields(controls: boolean = false): any {
    const {
      requestType,
      oldLicenseFullSerial,
      interventionName,
      projectDescription,
      beneficiaryCountry,
      beneficiaryRegion,
      executionCountry,
      executionRegion,
      description,
    } = this;

    return {
      requestType: controls ? [requestType, [CustomValidators.required]] : requestType,
      oldLicenseFullSerial: controls ? [oldLicenseFullSerial, [CustomValidators.maxLength(250)]] : oldLicenseFullSerial,
      interventionName: controls ? [interventionName, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : interventionName,
      projectDescription: controls ? [projectDescription, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : projectDescription,
      beneficiaryCountry: controls ? [beneficiaryCountry, [CustomValidators.required]] : beneficiaryCountry,
      beneficiaryRegion: controls ? [beneficiaryRegion, [CustomValidators.maxLength(50)]] : beneficiaryRegion,
      executionCountry: controls ? [executionCountry, [CustomValidators.required]] : executionCountry,
      executionRegion: controls ? [executionRegion, [CustomValidators.required, CustomValidators.maxLength(50)]] : executionRegion,
      description: controls ? [description, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : description,
    };
  }

  convertToUrgentInterventionClosure() {
    return (new UrgentInterventionClosure()).clone({
      caseType: CaseTypes.URGENT_INTERVENTION_CLOSURE,
      organizationId: this.organizationId,
      requestType: this.requestType,
      subject: this.subject,
      projectDescription: this.projectDescription,
      beneficiaryCountry: this.beneficiaryCountry,
      beneficiaryCountryInfo: this.beneficiaryCountryInfo,
      beneficiaryRegion: this.beneficiaryRegion,
      executionCountry: this.executionCountry,
      executionCountryInfo: this.executionCountryInfo,
      executionRegion: this.executionRegion,
      description: this.description,
      implementingAgencyList: this.implementingAgencyList,
      interventionRegionList: this.interventionRegionList,
      interventionFieldList: this.interventionFieldList,
      fullSerial: this.fullSerial
    });
  }

}
