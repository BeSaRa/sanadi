import { LookupService } from './../services/lookup.service';
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
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { ControlValueLabelLangKey } from '@app/types/types';
import { OrgExecutiveMember } from './org-executive-member';

const interceptor = new CharityOrganizationUpdateInterceptor();

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive,
})
export class CharityOrganizationUpdate extends CaseModel<
  CharityOrganizationUpdateService,
  CharityOrganizationUpdate
> implements HasFollowUpDate, IAuditModelProperties<CharityOrganizationUpdate> {
  service: CharityOrganizationUpdateService = FactoryService.getService(
    'CharityOrganizationUpdateService'
  );
  employeeService: EmployeeService = FactoryService.getService('EmployeeService');
  followUpService: FollowupDateService = FactoryService.getService('FollowupDateService');
  lookupService: LookupService = FactoryService.getService('LookupService');

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
  currentExecutiveManagementList: OrgExecutiveMember[] = [];
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
  updateSectionInfo!: AdminResult;
  requestTypeInfo!: AdminResult;

  workAreaObjectList: WorkArea[] = [];
  wFClassificationList!: ForeignAidClassification[];
  byLawList!: Bylaw[];

  riskReportList: CharityReport[] = [];
  coordinationSupportReport: CharityReport[] = [];
  incomingReportList: CharityReport[] = [];

  incomingDecisionList: CharityDecision[] = [];
  outgoingDecisionList: CharityDecision[] = [];

  publishDateStamp!: number | null;
  registrationDateStamp!: number | null;
  establishmentDateStamp!: number | null;
  firstReleaseDateStamp!: number | null;
  lastUpdateDateStamp!: number | null;

  getAdminResultByProperty(property: keyof CharityOrganizationUpdate): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'updateSection':
        adminResultValue = this.lookupService.listByCategory.CharityUpdateSection
                                .find(x => x.lookupKey === this.updateSection)?.createAdminResult() ??
                                                                        AdminResult.createInstance({});
        break;
      case 'charityId':
        adminResultValue = this.service.charityOrganizations
                                       .find(x=>x.id === this.charityId)?.createAdminResult()??
                                                                         AdminResult.createInstance({});
        break;
      case 'activityType':
        adminResultValue = this.activityTypeInfo;
        break;
      case 'organizationId':
        adminResultValue = this.ouInfo;
        break;
      case 'registrationAuthority':
        adminResultValue = this.registrationAuthorityInfo;
        break;
      case 'charityWorkArea':
        adminResultValue = this.charityWorkAreaInfo;
        break;

      case 'publishDate':
        const publishDateValue = DateUtils.getDateStringFromDate(this.publishDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({ arName: publishDateValue, enName: publishDateValue });
        break;
      case 'registrationDate':
        const registrationDateValue = DateUtils.getDateStringFromDate(this.registrationDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({ arName: registrationDateValue, enName: registrationDateValue });
        break;
      case 'establishmentDate':
        const establishmentDateValue = DateUtils.getDateStringFromDate(this.establishmentDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({ arName: establishmentDateValue, enName: establishmentDateValue });
        break;
      case 'firstReleaseDate':
        const firstReleaseDateValue = DateUtils.getDateStringFromDate(this.firstReleaseDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({ arName: firstReleaseDateValue, enName: firstReleaseDateValue });
        break;
      case 'lastUpdateDate':
        const lastUpdateDateValue = DateUtils.getDateStringFromDate(this.lastUpdateDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({ arName: lastUpdateDateValue, enName: lastUpdateDateValue });
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

  getSectionValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      updateSection: { langKey: 'section', value: this.updateSection },
      charityId: { langKey: 'organization', value: this.charityId },
     }
  }
  getMetaDataValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      arabicName: { langKey: 'arabic_name', value: this.arabicName },
      englishName: { langKey: 'english_name', value: this.englishName },
      shortName: { langKey: 'short_name', value: this.shortName },
      activityType: { langKey: 'activity_type', value: this.activityType },
      regulatingLaw: { langKey: 'regulating_law', value: this.regulatingLaw },
      registrationAuthority: { langKey: 'registration_authority', value: this.registrationAuthority },
      taxCardNo: { langKey: 'tax_card_number', value: this.taxCardNo },
      unifiedEconomicRecord: { langKey: 'unified_economic_record', value: this.unifiedEconomicRecord },
      publishDate: { langKey: 'publish_date', value: this.publishDate },
      registrationDate: { langKey: 'registration_date', value: this.registrationDate },
      establishmentDate: { langKey: 'establishment_date', value: this.establishmentDate },
      establishmentID: { langKey: 'establishment_id', value: this.establishmentID },
    }
  }
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
  getContactInformationValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      phone: { langKey: 'lbl_phone', value: this.phone },
      email: { langKey: 'lbl_email', value: this.email },
      website: { langKey: 'website', value: this.website },
      zoneNumber: { langKey: 'lbl_zone', value: this.zoneNumber },
      streetNumber: { langKey: 'lbl_street', value: this.streetNumber },
      buildingNumber: { langKey: 'building_number', value: this.buildingNumber },
      address: { langKey: 'lbl_address', value: this.address },
      facebook: { langKey: 'facebook', value: this.facebook },
      twitter: { langKey: 'twitter', value: this.twitter },
      instagram: { langKey: 'instagram', value: this.instagram },
      youTube: { langKey: 'youtube', value: this.youTube },
      snapChat: { langKey: 'snapchat', value: this.snapChat },
    }
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
      website: controls ? [website, [CustomValidators.required, CustomValidators.pattern('WEBSITE')]] : website,
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
  getPrimaryLawValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      domain: { langKey: 'domain', value: this.domain },
      country: { langKey: 'country', value: this.country },
      firstReleaseDate: { langKey: 'first_realase_date', value: this.firstReleaseDate },
      lastUpdateDate: { langKey: 'last_update_date', value: this.lastUpdateDate },
      goals: { langKey: 'goals', value: this.goals },
      charityWorkArea: { langKey: 'work_area', value: this.charityWorkArea },
    }
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
