import { ControlValueLabelLangKey } from './../types/types';
import { CaseTypes } from '@app/enums/case-types.enum';
import { LangService } from '@app/services/lang.service';
import { EmployeeService } from '@app/services/employee.service';
import { UrgentInterventionAnnouncementService } from '@services/urgent-intervention-announcement.service';
import { FactoryService } from '@app/services/factory.service';
import { AdminResult } from '@app/models/admin-result';
import { ImplementingAgency } from '@app/models/implementing-agency';
import { InterventionRegion } from '@app/models/intervention-region';
import { InterventionField } from '@app/models/intervention-field';
import { ISearchFieldsMap } from '@app/types/types';
import { dateSearchFields } from '@app/helpers/date-search-fields';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { CaseModel } from '@app/models/case-model';
import { CustomValidators } from '@app/validators/custom-validators';
import { mixinRequestType } from '@app/mixins/mixin-request-type';
import { HasRequestType } from '@contracts/has-request-type';
import { UrgentInterventionClosure } from '@app/models/urgent-intervention-closure';
import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { UrgentInterventionAnnouncementInterceptor } from "@app/model-interceptors/urgent-intervention-announcement-interceptor";
import { CommonUtils } from '@app/helpers/common-utils';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';

const _RequestType = mixinRequestType(CaseModel);
const { send, receive } = new UrgentInterventionAnnouncementInterceptor();

@InterceptModel({ send, receive })
export class UrgentInterventionAnnouncement extends _RequestType<UrgentInterventionAnnouncementService, UrgentInterventionAnnouncement> implements IAuditModelProperties<UrgentInterventionAnnouncement>, HasRequestType {
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  caseType: number = CaseTypes.URGENT_INTERVENTION_ANNOUNCEMENT;
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
  vsId!: string;
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

  service: UrgentInterventionAnnouncementService;
  langService: LangService;
  employeeService: EmployeeService;

  ignoreSendInterceptor?: boolean;

  searchFields: ISearchFieldsMap<UrgentInterventionAnnouncement> = {
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
    this.service = FactoryService.getService('UrgentInterventionAnnouncementService');
    this.langService = FactoryService.getService('LangService');
    this.employeeService = FactoryService.getService('EmployeeService');
    this.finalizeSearchFields();
  }
  getBasicInfoValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      requestType: { langKey: 'request_type', value: this.requestType },
      oldLicenseFullSerial: { langKey: 'notification_request_number', value: this.oldLicenseFullSerial },
      interventionName: { langKey: 'intervention_name', value: this.interventionName },
      projectDescription: { langKey: 'lbl_description', value: this.projectDescription },
      beneficiaryCountry: { langKey: 'country', value: this.beneficiaryCountry },
      beneficiaryRegion: { langKey: 'region', value: this.beneficiaryRegion },
      executionCountry: { langKey: 'country', value: this.executionCountry },
      executionRegion: { langKey: 'region', value: this.executionRegion },
      description: { langKey: 'special_explanations', value: this.description },
    };
  }
  getBasicFormFields(controls: boolean = false): any {
    const values = ObjectUtils.getControlValues<UrgentInterventionAnnouncement>(this.getBasicInfoValuesWithLabels())
    return {
      requestType: controls ? [values.requestType, [CustomValidators.required]] : values.requestType,
      oldLicenseFullSerial: controls ? [values.oldLicenseFullSerial, [CustomValidators.maxLength(250)]] : values.oldLicenseFullSerial,
      interventionName: controls ? [values.interventionName, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : values.interventionName,
      projectDescription: controls ? [values.projectDescription, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.projectDescription,
      beneficiaryCountry: controls ? [values.beneficiaryCountry, [CustomValidators.required]] : values.beneficiaryCountry,
      beneficiaryRegion: controls ? [values.beneficiaryRegion, [CustomValidators.required, CustomValidators.maxLength(50)]] : values.beneficiaryRegion,
      executionCountry: controls ? [values.executionCountry, [CustomValidators.required]] : values.executionCountry,
      executionRegion: controls ? [values.executionRegion, [CustomValidators.required, CustomValidators.maxLength(50)]] : values.executionRegion,
      description: controls ? [values.description, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.description,
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

  getAdminResultByProperty(property: keyof UrgentInterventionAnnouncement): AdminResult {
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
