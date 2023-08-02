import { CoordinationWithOrganizationTemplate } from './corrdination-with-organization-template';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { CaseTypes } from '@app/enums/case-types.enum';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { dateSearchFields } from '@app/helpers/date-search-fields';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { HasLicenseDurationType } from '@app/interfaces/has-license-duration-type';
import { HasRequestType } from '@app/interfaces/has-request-type';
import { mixinLicenseDurationType } from '@app/mixins/mixin-license-duration';
import { mixinRequestType } from '@app/mixins/mixin-request-type';
import { OrganizationOfficer } from '@app/models/organization-officer';
import { CoordinationWithOrganizationsRequestService } from '@app/services/coordination-with-organizations-request.service';
import { FactoryService } from '@app/services/factory.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { ControlValueLabelLangKey, ISearchFieldsMap } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { IMyDateModel } from 'angular-mydatepicker';
import { CoordinationTypes } from './../enums/coordination-types-enum';
import { CoordinationWithOrganizationsRequestInterceptor } from './../model-interceptors/coordination-with-organizations-request-interceptor';
import { AdminResult } from './admin-result';
import { BuildingAbility } from './building-ability';
import { CaseModel } from './case-model';
import { EffectiveCoordinationCapabilities } from './effective-coordination-capabilities';
import { ParticipantOrg } from './participant-org';
import { ResearchAndStudies } from './research-and-studies';
import { TaskAdminResult } from './task-admin-result';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { DateUtils } from '@app/helpers/date-utils';

const _RequestType = mixinLicenseDurationType(mixinRequestType(CaseModel));
const interceptor = new CoordinationWithOrganizationsRequestInterceptor();

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive,
})
export class CoordinationWithOrganizationsRequest
  extends _RequestType<
  CoordinationWithOrganizationsRequestService,
  CoordinationWithOrganizationsRequest
  >
  implements HasRequestType, HasLicenseDurationType,IAuditModelProperties<CoordinationWithOrganizationsRequest> {
  caseType: number = CaseTypes.COORDINATION_WITH_ORGANIZATION_REQUEST;
  fullName!: string;
  domain!: number;

  processId!: number;
  licenseStartDate!: string | IMyDateModel;
  licenseEndDate!: string | IMyDateModel;
  description!: string;
  isApproved!:boolean;
  participatingOrganizaionList: ParticipantOrg[] = [];
  organizaionOfficerList: OrganizationOfficer[] = [];
  buildingAbilitiesList: BuildingAbility[] = [];
  effectiveCoordinationCapabilities: EffectiveCoordinationCapabilities[] = [];
  researchAndStudies: ResearchAndStudies[] = [];
  templateList: CoordinationWithOrganizationTemplate[] = [];
  temporaryBuildingAbilitiesList: BuildingAbility[] = [];
  temporaryEffectiveCoordinationCapabilities: EffectiveCoordinationCapabilities[] = [];
  temporaryOrganizaionOfficerList: OrganizationOfficer[] = [];
  temporaryResearchAndStudies: ResearchAndStudies[] = [];
  temporaryTemplateList: CoordinationWithOrganizationTemplate[] = [];
  locations: TaskAdminResult[] = [];

  coordinationReportId?:string;
  coordinationReportVSId?:string;
  approved = false;
  domainInfo!: AdminResult;

  licenseStartDateStamp!:number |null;
  licenseEndDateStamp!:number | null;

  searchFields: ISearchFieldsMap<CoordinationWithOrganizationsRequest> = {
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['domainInfo', 'caseStatusInfo']),
    ...normalSearchFields(['fullName', 'fullSerial']),
  };
  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }
  service: CoordinationWithOrganizationsRequestService;
  constructor() {
    super();
    this.service = FactoryService.getService(
      'CoordinationWithOrganizationsRequestService'
    );
    this.filterSearchFields();
  }

  isArrayRequired(type: CoordinationTypes): boolean {
    if (this.id) {
      if (this.domain === type) {
        return true;
      }
    }
    return false;
  }
  getAdminResultByProperty(property: keyof CoordinationWithOrganizationsRequest): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'requestType':
        adminResultValue = this.requestTypeInfo;
        break;
      case 'caseStatus':
        adminResultValue = this.caseStatusInfo;
        break;
      case 'domain':
        adminResultValue = this.domainInfo;
        break;
      case 'processId':
        adminResultValue = this.service.formsList.find(x=>x.id === this.processId)?.createAdminResult()?? AdminResult.createInstance({});
        break;
      case 'licenseStartDate':
        const startDateValue = DateUtils.getDateStringFromDate(this.licenseStartDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({arName: startDateValue, enName: startDateValue});
        break;
      case 'licenseEndDate':
        const endDateValue = DateUtils.getDateStringFromDate(this.licenseEndDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({arName: endDateValue, enName: endDateValue});
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
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  getBasicInfoValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      requestType: { langKey: 'request_type', value: this.requestType },
      processId: { langKey: 'lbl_template', value: this.processId },
      fullName: { langKey: 'coordination_request', value: this.fullName },
      domain: { langKey: 'domain', value: this.domain },
      licenseStartDate: { langKey: 'starting_date', value: this.licenseStartDate,comparisonValue : this.licenseStartDateStamp },
      licenseEndDate: { langKey: 'ending_date', value: this.licenseEndDate, comparisonValue: this.licenseEndDateStamp },
      }
  }
  getExplanationValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      description: {langKey: 'special_explanations', value: this.description},
     }
  }
  formBuilder(controls?: boolean) {
    const { fullName, domain, processId, licenseStartDate, licenseEndDate, description } =
      this;
    return {
      fullName: controls
        ? [
          fullName,
          [Validators.required].concat(
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.ENGLISH_NAME_MAX
            ),
            CustomValidators.minLength(
              CustomValidators.defaultLengths.MIN_LENGTH
            )
          ),
        ]
        : fullName,
      domain: controls ? [domain, [Validators.required]] : domain,
      processId: controls ? [processId, []] : processId,
      licenseStartDate: controls
        ? [licenseStartDate, [Validators.required]]
        : licenseStartDate,
      licenseEndDate: controls
        ? [licenseEndDate, [Validators.required]]
        : licenseEndDate,
      description: controls ? [description] : description,
    };
  }

  organizationApprove(externalUserData: {
    form: UntypedFormGroup;
    organizationOfficers: OrganizationOfficer[];
  }): DialogRef {
    return this.service.organizationApprove(
      this.taskDetails.tkiid,
      this.caseType,
      WFResponseType.ORGANIZATION_APPROVE,
      false,
      this,
      externalUserData
    );
  }
  organizationFinalApprove(externalUserData: {
    form: UntypedFormGroup;
    organizationOfficers: OrganizationOfficer[];
  }): DialogRef {
    return this.service.organizationApprove(
      this.taskDetails.tkiid,
      this.caseType,
      WFResponseType.ORGANIZATION_FINAL_APPROVE,
      false,
      this,
      externalUserData
    );
  }

}
