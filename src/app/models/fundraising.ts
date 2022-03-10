import { FactoryService } from "@app/services/factory.service";
import { FundraisingService } from "@app/services/fundraising.service";
import { AdminResult } from "./admin-result";
import { CaseModel } from "./case-model";
import { TaskDetails } from "./task-details";

export class Fundraising extends CaseModel<FundraisingService, Fundraising> {
  service: FundraisingService;
  id!: string;
  createdOn!: string;
  lastModified!: string;
  classDescription!: string;
  creatorInfo!: AdminResult;
  ouInfo!: AdminResult;
  serial!: number;
  fullSerial!: string;
  caseStatus!: number;
  caseType!: number;
  organizationId!: number;
  taskDetails!: TaskDetails;
  caseStatusInfo!: AdminResult;
  about!: string;
  arName!: string;
  chiefDecision!: number;
  chiefJustification!: string;
  conditionalLicenseIndicator!: boolean;
  customTerms!: string;
  description!: string;
  enName!: string;
  exportedLicenseFullSerial!: string;
  exportedLicenseId!: string;
  exportedLicenseSerial!: number;
  followUpDate!: string;
  licenseDurationType!: number;
  licenseDuration!: number;
  licenseVSID!: string;
  licenseStatus!: number;
  licenseStartDate!: string;
  licenseApprovedDate!: string;
  licenseEndDate!: string;
  managerDecision!: number;
  managerJustification!: string;
  oldLicenseFullSerial!: string;
  oldLicenseId!: string;
  oldLicenseSerial!: number;
  publicTerms!: string;
  requestType!: number;
  reviewerDepartmentDecision!: number;
  reviewerDepartmentJustification!: string;
  specialistDecision!: number;
  specialistJustification!: string;
  subject!: string;
  inRenewalPeriod!: boolean;
  managerDecisionInfo!: AdminResult;
  reviewerDepartmentDecisionInfo!: AdminResult;
  licenseStatusInfo!: AdminResult;
  specialistDecisionInfo!: AdminResult;
  chiefDecisionInfo!: AdminResult;
  riskAssessment!: string;
  workingMechanism!: string;
  requestTypeInfo!: AdminResult;
  className!: string;

  constructor(){
      super();
      this.service = FactoryService.getService('FundraisingService');
  }
}
