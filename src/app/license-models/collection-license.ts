import {AdminResult} from "@app/models/admin-result";

export class CollectionLicense {
  caseStatusInfo!: AdminResult
  chiefDecisionInfo!: AdminResult
  classDescription!: string;
  conditionalLicenseIndicator!: boolean
  createdOn!: string;
  creatorInfo!: AdminResult
  customTerms!: string;
  documentTitle!: string
  followUpDate!: string;
  fullSerial!: string;
  id!: string;
  inRenewalPeriod!: number
  lastModified!: string;
  licenseApprovedDate!: string;
  licenseDuration!: number
  licenseDurationTypeInfo!: AdminResult;
  licenseEndDate!: string;
  licenseStartDate!: string;
  licenseStatus!: number
  licenseStatusInfo!: AdminResult
  licenseType!: number
  lockOwner!: string
  lockTimeout!: string
  managerDecisionInfo!: AdminResult
  mimeType!: string;
  orgInfo!: AdminResult
  organizationCode!: string;
  organizationId!: number
  ouInfo!: AdminResult;
  publicTerms!: string;
  requestClassificationInfo!: AdminResult;
  requestTypeInfo!: AdminResult;
  reviewerDepartmentDecisionInfo!: AdminResult;
  secondSpecialistDecisionInfo!: AdminResult;
  serial!: number
  specialistDecision!: number
  specialistDecisionInfo!: AdminResult;
}
