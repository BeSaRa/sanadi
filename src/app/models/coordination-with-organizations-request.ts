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
import { ISearchFieldsMap } from '@app/types/types';
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
  implements HasRequestType, HasLicenseDurationType {
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
