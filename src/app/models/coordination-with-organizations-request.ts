import { CoordinationTypes } from './../enums/coordination-types-enum';
import { IMyDateModel } from 'angular-mydatepicker';
import { OrganizationOfficer } from '@app/models/organization-officer';
import { OrgUser } from '@app/models/org-user';
import { ResearchAndStudies } from './research-and-studies';
import { EffectiveCoordinationCapabilities } from './effective-coordination-capabilities';
import { CoordinationWithOrganizationsRequestInterceptor } from './../model-interceptors/coordination-with-organizations-request-interceptor';
import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { HasLicenseDurationType } from '@app/interfaces/has-license-duration-type';
import { HasRequestType } from '@app/interfaces/has-request-type';
import { mixinLicenseDurationType } from '@app/mixins/mixin-license-duration';
import { mixinRequestType } from '@app/mixins/mixin-request-type';
import { CoordinationWithOrganizationsRequestService } from '@app/services/coordination-with-organizations-request.service';
import { FactoryService } from '@app/services/factory.service';
import { CaseModel } from './case-model';
import { CaseTypes } from '@app/enums/case-types.enum';
import { ISearchFieldsMap } from '@app/types/types';
import { dateSearchFields } from '@app/helpers/date-search-fields';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { BuildingAbility } from './building-ability';
import { ParticipantOrg } from './participant-org';
import { CustomValidators } from '@app/validators/custom-validators';

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
  implements HasRequestType, HasLicenseDurationType
{
  caseType: number = CaseTypes.COORDINATION_WITH_ORGANIZATION_REQUEST;
  fullName!: string;
  domain!: number;
  licenseStartDate!: string | IMyDateModel;
  licenseEndDate!: string | IMyDateModel;
  description!: string;
  participatingOrganizaionList: ParticipantOrg[] = [];
  organizaionOfficerList: OrganizationOfficer[] = [];
  buildingAbilitiesList: BuildingAbility[] = [];
  effectiveCoordinationCapabilities: EffectiveCoordinationCapabilities[] = [];
  researchAndStudies: ResearchAndStudies[] = [];

  searchFields: ISearchFieldsMap<CoordinationWithOrganizationsRequest> = {
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['creatorInfo', 'caseStatusInfo', 'categoryInfo']),
    ...normalSearchFields(['fullName', 'fullSerial']),
  };
  service: CoordinationWithOrganizationsRequestService;
  constructor() {
    super();
    this.service = FactoryService.getService(
      'CoordinationWithOrganizationsRequestService'
    );
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
    const {
      fullName,
      domain,
      licenseStartDate,
      licenseEndDate,
      description,
    } = this;
    return {
      fullName: controls ? [fullName, CustomValidators.required] : fullName,
      domain: controls ? [domain, CustomValidators.required] : domain,
      licenseStartDate: controls
        ? [licenseStartDate, CustomValidators.required]
        : licenseStartDate,
      licenseEndDate: controls
        ? [licenseEndDate, CustomValidators.required]
        : licenseEndDate,
      description: controls ? [description] : description,
    };
  }
}
