import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { CaseTypes } from '@app/enums/case-types.enum';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { DateUtils } from '@app/helpers/date-utils';
import { HasFollowUpDate } from '@app/interfaces/has-follow-up-date';
import { CharityOrganizationUpdateInterceptor } from '@app/model-interceptors/charity-organization-update-interceptor';
import { CharityOrganizationUpdateService } from '@app/services/charity-organization-update.service';
import { EmployeeService } from '@app/services/employee.service';
import { FactoryService } from '@app/services/factory.service';
import { FollowupDateService } from '@app/services/follow-up-date.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { CustomValidators } from '@app/validators/custom-validators';
import { IMyDate, IMyDateModel } from 'angular-mydatepicker';
import { AdminResult } from './admin-result';
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
> implements HasFollowUpDate {
  service: CharityOrganizationUpdateService = FactoryService.getService(
    'CharityOrganizationUpdateService'
  );
  employeeService: EmployeeService = FactoryService.getService('EmployeeService');
  followUpService: FollowupDateService = FactoryService.getService('FollowupDateService');
  caseType: number = CaseTypes.CHARITY_ORGANIZATION_UPDATE;

  followUpDate!: string | IMyDateModel;
  arabicName = '';
  englishName = '';
  shortName!: string;
  logoFnId!: string;
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
  updateSection!: number;
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
      publishDate: controls ? [publishDate] : publishDate,
      arabicName: controls ? [arabicName] : arabicName,
      englishName: controls ? [englishName] : englishName,
      shortName: controls
        ? [
          shortName,
          [
            CustomValidators.required,
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.NUMBERS_MAXLENGTH
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
        ? [registrationAuthority]
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
            CustomValidators.required,
            CustomValidators.maxLength(
              20
            ),
          ],
        ]
        : establishmentID,
    };
  }
  getFirstPageForm(controls = true) {
    const { updateSection,
      registrationAuthority,
      charityId } = this;
    return {
      updateSection: controls
        ? [updateSection, [CustomValidators.required]]
        : updateSection,
      charityId: controls
        ? [charityId, [CustomValidators.required]]
        : charityId,
      registrationAuthority: controls
        ? [registrationAuthority]
        : registrationAuthority,

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
      website: controls ? [website, [CustomValidators.required, CustomValidators.maxLength(350)]] : website,
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
      facebook: controls ? [facebook, [CustomValidators.maxLength(350)]] : facebook,
      twitter: controls ? [twitter, [CustomValidators.maxLength(350)]] : twitter,
      instagram: controls ? [instagram, [CustomValidators.maxLength(350)]] : instagram,
      youTube: controls ? [youTube, [CustomValidators.maxLength(350)]] : youTube,
      snapChat: controls ? [snapChat, [CustomValidators.maxLength(350)]] : snapChat,
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
  validateApprove(): DialogRef {
    return this.followUpService.finalApproveTask(this, WFResponseType.VALIDATE_APPROVE);
  }
  finalApprove(): DialogRef {
    return this.followUpService.finalApproveTask(this, WFResponseType.FINAL_APPROVE);
  }
  approve(): DialogRef {
    return this.followUpService.finalApproveTask(this, WFResponseType.APPROVE);
  }
  validateReject(): DialogRef {
    return this.inboxService!.takeActionWithComment(this.taskDetails.tkiid, this.caseType, WFResponseType.VALIDATE_REJECT, false, this, 'reject_reason');
  }
  reject(): DialogRef {
    return this.inboxService!.takeActionWithComment(this.taskDetails.tkiid, this.caseType, WFResponseType.REJECT, false, this, 'reject_reason');
  }
}
