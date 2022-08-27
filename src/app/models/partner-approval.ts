import { AdminResult } from "./admin-result";
import { BankAccount } from "./bank-account";
import { ExecutiveManagement } from "./executive-management";
import { TargetGroup } from "./target-group";
import { Goal } from "./goal";
import { ManagementCouncil } from "./management-council";
import { ContactOfficer } from "./contact-officer";
import { ApprovalReason } from "./approval-reason";
import { PartnerApprovalService } from "@services/partner-approval.service";
import { FactoryService } from "@services/factory.service";
import { CustomValidators } from "../validators/custom-validators";
import { LicenseApprovalModel } from "@app/models/license-approval-model";
import { DateUtils } from "@app/helpers/date-utils";
import { CaseTypes } from '@app/enums/case-types.enum';
import { ISearchFieldsMap } from "@app/types/types";
import { dateSearchFields } from "@app/helpers/date-search-fields";
import { infoSearchFields } from "@app/helpers/info-search-fields";
import { normalSearchFields } from "@app/helpers/normal-search-fields";
import { InterceptModel } from "@decorators/intercept-model";
import { PartnerApprovalInterceptor } from "@app/model-interceptors/partner-approval-interceptor";

const { send, receive } = new PartnerApprovalInterceptor();
@InterceptModel({ send, receive })
export class PartnerApproval extends LicenseApprovalModel<PartnerApprovalService, PartnerApproval> {
  caseType: number = CaseTypes.PARTNER_APPROVAL;
  organizationId!: number;
  address!: string;
  arName!: string;
  chiefDecision!: number;
  chiefJustification!: string;
  region!: string;
  country!: number;
  countryInfo!: AdminResult;
  specialistDecisionInfo!: AdminResult;
  chiefDecisionInfo!: AdminResult;
  managerDecisionInfo!: AdminResult;
  reviewerDepartmentDecisionInfo!: AdminResult;
  licenseStatusInfo!: AdminResult;
  email!: string;
  enName!: string;
  establishmentDate!: string;
  fax!: string;
  headQuarterType!: number;
  latitude!: string;
  longitude!: string;
  managerDecision!: number;
  managerJustification!: string;
  phone!: string;
  postalCode!: string;
  requestClassification!: number;
  requestClassificationInfo!: AdminResult;
  reviewerDepartmentDecision!: number;
  reviewerDepartmentJustification!: string;
  firstSocialMedia!: string;
  secondSocialMedia!: string;
  thirdSocialMedia!: string;
  specialistDecision!: number;
  specialistJustification!: string;
  state!: number;
  subject!: string;
  website!: string;
  bankAccountList!: BankAccount[];
  approvalReasonList!: ApprovalReason[]
  contactOfficerList!: ContactOfficer[]
  executiveManagementList!: ExecutiveManagement[];
  managementCouncilList!: ManagementCouncil[];
  goalsList!: Goal[];
  targetGroupList!: TargetGroup[];
  description!: string;

  service: PartnerApprovalService;

  searchFields: ISearchFieldsMap<PartnerApproval> = {
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['creatorInfo', 'caseStatusInfo', 'countryInfo', 'requestClassificationInfo', 'ouInfo']),
    ...normalSearchFields(['subject', 'fullSerial'])
  }

  constructor() {
    super();
    this.service = FactoryService.getService('PartnerApprovalService');
    this.finalizeSearchFields();
  }

  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }

  getBasicFields(control: boolean = false): any {
    const {
      requestType, requestClassification, arName, enName, country, region, headQuarterType, latitude,
      longitude, address, establishmentDate, phone, fax, website, email, postalCode,
      firstSocialMedia, secondSocialMedia, thirdSocialMedia, organizationId, description,
      oldLicenseFullSerial, oldLicenseId, oldLicenseSerial
    } = this;

    return {
      organizationId: control ? [organizationId, [CustomValidators.required]] : organizationId,
      oldLicenseFullSerial: control ? [oldLicenseFullSerial, [CustomValidators.maxLength(250)]] : oldLicenseFullSerial,
      oldLicenseId: control ? [oldLicenseId] : oldLicenseId,
      oldLicenseSerial: control ? [oldLicenseSerial] : oldLicenseSerial,
      requestType: control ? [requestType, CustomValidators.required] : requestType,
      requestClassification: control ? [requestClassification, CustomValidators.required] : requestClassification,
      arName: control ? [arName, [CustomValidators.required, CustomValidators.pattern('AR_ONLY'),
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : arName,
      enName: control ? [enName, [CustomValidators.required, CustomValidators.pattern('ENG_ONLY'),
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : enName,
      country: control ? [country, CustomValidators.required] : country,
      region: control ? [region, [CustomValidators.required, CustomValidators.maxLength(50)]] : region,
      headQuarterType: control ? [headQuarterType, CustomValidators.required] : headQuarterType,
      latitude: control ? [latitude,
        [CustomValidators.required, CustomValidators.maxLength(12), CustomValidators.pattern('NUM_HYPHEN_COMMA')]] : latitude,
      longitude: control ? [longitude,
        [CustomValidators.required, CustomValidators.maxLength(12), CustomValidators.pattern('NUM_HYPHEN_COMMA')]] : longitude,
      address: control ? [address, CustomValidators.required] : address,
      establishmentDate: control ? [establishmentDate, [CustomValidators.required, CustomValidators.maxDate(new Date())]] : DateUtils.changeDateToDatepicker(establishmentDate),
      phone: control ? [phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : phone,
      fax: control ? [fax, [CustomValidators.required].concat(CustomValidators.commonValidations.fax)] : fax,
      website: control ? [website, [CustomValidators.required, CustomValidators.maxLength(100)]] : website,
      email: control ? [email, [CustomValidators.required, CustomValidators.pattern('EMAIL'), CustomValidators.maxLength(100)]] : email,
      postalCode: control ? [postalCode, [CustomValidators.required, CustomValidators.maxLength(100)]] : postalCode,
      firstSocialMedia: control ? [firstSocialMedia, [CustomValidators.required, CustomValidators.maxLength(100)]] : firstSocialMedia,
      secondSocialMedia: control ? [secondSocialMedia, CustomValidators.maxLength(100)] : secondSocialMedia,
      thirdSocialMedia: control ? [thirdSocialMedia, CustomValidators.maxLength(100)] : thirdSocialMedia,
      description: control ? [description, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : description,
    }
  }
}
