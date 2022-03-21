import { CaseTypes } from "@app/enums/case-types.enum";
import { FactoryService } from "@app/services/factory.service";
import { FundraisingService } from "@app/services/fundraising.service";
import { CustomValidators } from "@app/validators/custom-validators";
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
  caseType: number = CaseTypes.FUNDRAISING_LICENSING;
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

  constructor() {
    super();
    this.service = FactoryService.getService("FundraisingService");
  }

  buildBasicInfo(controls: boolean = false): any {
    const {
      requestType,
      licenseDurationType,
      oldLicenseFullSerial,
      arName,
      enName,
      about,
      workingMechanism,
      riskAssessment,
    } = this;
    return {
      requestType: controls
        ? [requestType, [CustomValidators.required]]
        : requestType,
      licenseDurationType: controls
        ? [licenseDurationType, [CustomValidators.required]]
        : licenseDurationType,
      oldLicenseFullSerial: controls
        ? [oldLicenseFullSerial, [CustomValidators.maxLength(250)]]
        : oldLicenseFullSerial,
      arName: controls
        ? [
            arName,
            [
              CustomValidators.required,
              CustomValidators.pattern("AR_ONLY"),
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ARABIC_NAME_MAX
              ),
              CustomValidators.minLength(
                CustomValidators.defaultLengths.MIN_LENGTH
              ),
            ],
          ]
        : arName,
      enName: controls
        ? [
            enName,
            [
              CustomValidators.required,
              CustomValidators.pattern("ENG_ONLY"),
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              ),
              CustomValidators.minLength(
                CustomValidators.defaultLengths.MIN_LENGTH
              ),
            ],
          ]
        : enName,
      about: controls ? [about, [CustomValidators.required]] : about,
      workingMechanism: controls
        ? [workingMechanism, [CustomValidators.required]]
        : workingMechanism,
      riskAssessment: controls
        ? [riskAssessment, [CustomValidators.required]]
        : riskAssessment,
    };
  }

  buildExplanation(controls: boolean = false): any {
    const { description } = this;
    return {
      description: controls
        ? [description, [CustomValidators.required]]
        : description,
    };
  }
}
