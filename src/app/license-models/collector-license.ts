import { AdminResult } from '@app/models/admin-result';
import { IMyDateModel } from 'angular-mydatepicker';
import { CollectorItem } from '@app/models/collector-item';
import { CollectorLicenseInterceptor } from "@app/license-interceptors/collector-license-interceptor";
import { InterceptModel } from "@decorators/intercept-model";

const { send, receive } = new CollectorLicenseInterceptor();

@InterceptModel({ send, receive })
export class CollectorLicense {
  arName!: string;
  chiefDecision!: number;
  chiefJustification!: string;
  classDescription!: string;
  collectorNumber!: string;
  collectorType!: number;
  conditionalLicenseIndicator!: boolean;
  createdOn!: string;
  currentVersion!: number;
  currentVersionDate!: string;
  customTerms!: string;
  description!: string;
  documentTitle!: string;
  followUpDate!: string;
  fullSerial!: string;
  gender!: number;
  id!: string;
  identificationNumber!: string;
  inRenewalPeriod!: boolean;
  isCurrent!: boolean;
  jobTitle!: string;
  lastModified!: string;
  licenseApprovedDate!: string;
  licenseDuration!: string;
  licenseDurationType!: number;
  licenseEndDate!: string | IMyDateModel;
  licenseStartDate!: string;
  licenseStatus!: number;
  licenseType!: number;
  lockOwner!: boolean;
  lockTimeout!: boolean;
  majorVersionNumber!: number;
  managerDecision!: number;
  managerJustification!: string;
  mimeType!: string;
  minorVersionNumber!: number;
  mobileNo!: string;
  nationality!: number;
  oldLicenseFullSerial!: string;
  organizationCode!: string;
  organizationId!: number;
  email!: string;
  publicTerms!: string;
  relationship!: number;
  requestCaseId!: string;
  requestType!: number;
  reviewerDepartmentDecision!: number;
  reviewerDepartmentJustification!: string;
  secondSpecialistDecision!: number;
  secondSpecialistJustification!: string;
  serial!: number;
  specialistDecision!: number;
  specialistJustification!: string;
  subject!: string;
  versionStatus!: number;
  vsId!: string;
  caseStatusInfo!: AdminResult;
  chiefDecisionInfo!: AdminResult;
  collectorTypeInfo!: AdminResult;
  creatorInfo!: AdminResult;
  genderInfo!: AdminResult;
  licenseDurationTypeInfo!: AdminResult;
  licenseStatusInfo!: AdminResult;
  managerDecisionInfo!: AdminResult;
  nationalityInfo!: AdminResult;
  orgInfo!: AdminResult;
  ouInfo!: AdminResult;
  relationshipInfo!: AdminResult;
  requestClassificationInfo!: AdminResult;
  requestTypeInfo!: AdminResult;
  reviewerDepartmentDecisionInfo!: AdminResult;
  secondSpecialistDecisionInfo!: AdminResult;
  specialistDecisionInfo!: AdminResult;

  convertToItem(): CollectorItem {
    const collectorItem = new CollectorItem();
    collectorItem.oldLicenseId = this.id;
    collectorItem.oldLicenseFullSerial = this.fullSerial;
    collectorItem.identificationNumber = this.identificationNumber;
    collectorItem.collectorType = this.collectorType;
    collectorItem.arabicName = this.arName;
    collectorItem.jobTitle = this.jobTitle;
    collectorItem.collectorNumber = this.collectorNumber;
    collectorItem.gender = this.gender;
    collectorItem.nationality = this.nationality;
    collectorItem.relationship = this.relationship;
    collectorItem.email = this.email;
    collectorItem.licenseEndDate = this.licenseEndDate;
    collectorItem.licenseStartDate = this.licenseStartDate || this.licenseApprovedDate
    // collectorItem.licenseEndDate = this.licenseEndDate
    return collectorItem;
  }
}
