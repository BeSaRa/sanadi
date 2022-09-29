import { FormControl } from '@angular/forms';
import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { CaseTypes } from '@app/enums/case-types.enum';
import { DateUtils } from '@app/helpers/date-utils';
import { CharityOrganizationUpdateInterceptor } from '@app/model-interceptors/charity-organization-update-interceptor';
import { CharityOrganizationUpdateService } from '@app/services/charity-organization-update.service';
import { FactoryService } from '@app/services/factory.service';
import { CustomValidators } from '@app/validators/custom-validators';
import { IMyDate } from 'angular-mydatepicker';
import { AdminResult } from './admin-result';
import { Beneficiary } from './beneficiary';
import { Bylaw } from './bylaw';
import { CaseModel } from './case-model';
import { CharityBranch } from './charity-branch';
import { CharityDecision } from './charity-decision';
import { CharityReport } from './charity-report';
import { ForeignAidClassification } from './foreign-aid-classification';
import { OrgMember } from './org-member';
import { OrganizationOfficer } from './organization-officer';
import { RealBeneficiary } from './real-beneficiary';
import { WorkArea } from './work-area';

const interceptor = new CharityOrganizationUpdateInterceptor();

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive,
})
export class CharityOrganizationUpdate extends CaseModel<
  CharityOrganizationUpdateService,
  CharityOrganizationUpdate
> {
  service: CharityOrganizationUpdateService = FactoryService.getService(
    'CharityOrganizationUpdateService'
  );
  caseType: number = CaseTypes.CHARITY_ORGANIZATION_UPDATE;

  arabicName = '';
  englishName = '';
  shortName!: string;
  logoId!: string;
  activityType!: number;
  activityTypeInfo!: AdminResult;
  createdOn!: string;
  regulatingLaw!: string;
  registrationAuthority!: number;
  publishDate!: string;
  registrationDate!: string;
  registrationAuthorityInfo!: AdminResult;
  taxCardNo?: string;
  unifiedEconomicRecord?: string;
  charityId!: number;
  phone!: string;
  email!: string;
  website!: string;
  zoneNumber!: string;
  streetNumber!: string;
  buildingNumber!: string;
  address!: string;
  facebook!: string;
  twitter!: string;
  instagram!: string;
  snapChat!: string;
  youTube!: string;
  requestType!: number;
  establishmentDate!: string;
  complianceOfficerList: OrganizationOfficer[] = [];
  charityContactOfficerList: OrganizationOfficer[] = [];
  charityBranchList: CharityBranch[] = [];
  establishmentID!: string;

  founderMemberList: OrgMember[] = [];
  generalAssemblyMemberList: OrgMember[] = [];
  boardMemberList: OrgMember[] = [];
  currentExecutiveManagementList: OrgMember[] = [];
  authorizedSignatoryMemberList: OrgMember[] = [];
  realBeneficiaryList: RealBeneficiary[] = [];
  firstReleaseDate!: string | IMyDate;
  lastUpdateDate!: string | IMyDate;
  goals!: string;
  charityWorkArea!: number;
  charityWorkAreaInfo!: AdminResult;
  country!: number;
  domain!: number;
  ouInfo!: AdminResult;

  workAreaObjectList: WorkArea[] = [];
  wFClassificationList!: ForeignAidClassification[];
  byLawList!: Bylaw[];

  riskReportList: CharityReport[] = [];
  coordinationSupportReport: CharityReport[] = [];
  incomingReportList: CharityReport[] = [];

  incomingDecisionList: CharityDecision[] = [];
  outgoingDecisionList: CharityDecision[] = [];
  buildMetaDataForm(controls = true) {
    const {
      arabicName,
      englishName,
      shortName,
      logoId,
      activityType,
      regulatingLaw,
      registrationAuthority,
      taxCardNo,
      unifiedEconomicRecord,
      publishDate,
      registrationDate,
      establishmentDate,
      establishmentID,
    } = this;
    return {
      publishDate,
      arabicName: controls ? [arabicName] : arabicName,
      englishName: controls ? [englishName] : englishName,
      shortName: controls
        ? [
          shortName,
          [
            CustomValidators.required,
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.SWIFT_CODE_MAX
            ),
          ],
        ]
        : shortName,
      activityType: controls
        ? [activityType, [CustomValidators.required]]
        : activityType,
      regulatingLaw: controls
        ? [
          regulatingLaw,
          [
            CustomValidators.required,
            CustomValidators.maxLength(
              300),
          ],
        ]
        : regulatingLaw,
      registrationAuthority: controls
        ? [registrationAuthority, [CustomValidators.required]]
        : registrationAuthority,
      taxCardNo: controls
        ? [
          taxCardNo,
          [
            CustomValidators.maxLength(
              300),
          ],
        ]
        : taxCardNo,
      unifiedEconomicRecord: controls
        ? [
          unifiedEconomicRecord,
          [
            CustomValidators.maxLength(
              300
            ),
          ],
        ]
        : unifiedEconomicRecord,
      registrationDate: controls ? [registrationDate] : registrationDate,

      establishmentDate: controls ? [establishmentDate] : establishmentDate,
      establishmentID: controls
        ? [
          establishmentID,
          [
            CustomValidators.maxLength(
              300
            ),
          ],
        ]
        : establishmentID,
    };
  }
  getFirstPageForm(controls = true) {
    const { requestType, charityId } = this;
    return {
      requestType: controls
        ? [requestType, [CustomValidators.required]]
        : requestType,
      charityId: controls
        ? [charityId, [CustomValidators.required]]
        : charityId,
    };
  }
  buildContactInformationForm(controls = true) {
    const {
      phone,
      email,
      website,
      zoneNumber,
      streetNumber,
      buildingNumber,
      address,
      facebook,
      twitter,
      instagram,
      youTube,
      snapChat,
    } = this;
    return {
      phone: controls
        ? [
          phone,
          [
            CustomValidators.required,
            ...CustomValidators.commonValidations.phone,
          ],
        ]
        : phone,
      email: controls
        ? [
          email,
          [
            CustomValidators.required,
            CustomValidators.pattern('EMAIL'),
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.EMAIL_MAX
            ),
          ],
        ]
        : email,
      website: controls ? [website, [CustomValidators.required, CustomValidators.maxLength(200)]] : website,
      zoneNumber: controls
        ? [
          zoneNumber,
          [
            CustomValidators.required,
            CustomValidators.maxLength(
              5
            ),
          ],
        ]
        : zoneNumber,
      streetNumber: controls
        ? [
          streetNumber,
          [
            CustomValidators.required,
            CustomValidators.maxLength(
              5
            ),
          ],
        ]
        : streetNumber,
      buildingNumber: controls
        ? [
          buildingNumber,
          [
            CustomValidators.required,
            CustomValidators.maxLength(
              5
            ),
          ],
        ]
        : buildingNumber,
      address: controls
        ? [
          address,
          [
            CustomValidators.required,
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.ADDRESS_MAX
            ),
          ],
        ]
        : address,
      facebook: controls ? [facebook] : facebook,
      twitter: controls ? [twitter] : twitter,
      instagram: controls ? [instagram] : instagram,
      youTube: controls ? [youTube] : youTube,
      snapChat: controls ? [snapChat] : snapChat,
    };
  }
  buildPrimaryLawForm(controls = true) {
    const {
      domain,
      country,
      firstReleaseDate,
      lastUpdateDate,
      goals,
      charityWorkArea,
    } = this;
    return {
      firstReleaseDate: controls
        ? [firstReleaseDate, [CustomValidators.required]]
        : DateUtils.changeDateToDatepicker(firstReleaseDate),
      lastUpdateDate: controls
        ? [lastUpdateDate, [CustomValidators.required]]
        : DateUtils.changeDateToDatepicker(lastUpdateDate),
      goals: controls ? [goals, [CustomValidators.required]] : goals,
      charityWorkArea: controls
        ? [charityWorkArea, [CustomValidators.required]]
        : charityWorkArea,
    };
  }
}
