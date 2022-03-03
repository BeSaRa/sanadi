import {CaseModel} from "@app/models/case-model";
import {CollectionApprovalService} from "@app/services/collection-approval.service";
import {FactoryService} from "@app/services/factory.service";
import {AdminResult} from "./admin-result";
import {CaseTypes} from "@app/enums/case-types.enum";
import {CustomValidators} from "@app/validators/custom-validators";
import {CollectionItem} from "@app/models/collection-item";

export class CollectionApproval extends CaseModel<CollectionApprovalService, CollectionApproval> {
  caseType: number = CaseTypes.COLLECTION_APPROVAL;
  organizationId!: number;
  serviceSteps!: string[];
  chiefDecision!: number;
  chiefJustification!: string;
  conditionalLicenseIndicator!: boolean;
  description!: string;
  followUpDate!: string;
  licenseDurationType!: number;
  licenseStartDate!: string;
  licenseEndDate!: string;
  managerDecision!: number;
  managerJustification!: string;
  publicTerms!: string;
  requestType!: number;
  requestClassification!: number;
  reviewerDepartmentDecision!: number;
  reviewerDepartmentJustification!: string;
  secondSpecialistDecision!: number;
  secondSpecialistJustification!: string;
  specialistDecision!: number;
  specialistJustification!: string;
  subject!: string;
  inRenewalPeriod!: boolean;
  collectionItemList: CollectionItem[] = [];
  managerDecisionInfo!: AdminResult;
  reviewerDepartmentDecisionInfo!: AdminResult;
  specialistDecisionInfo!: AdminResult;
  secondSpecialistDecisionInfo!: AdminResult;
  chiefDecisionInfo!: AdminResult;
  requestTypeInfo!: AdminResult;
  requestClassificationInfo!: AdminResult;
  licenseDurationTypeInfo!: AdminResult;

  service: CollectionApprovalService;

  constructor() {
    super();
    this.service = FactoryService.getService('CollectionApprovalService');
  }

  buildForm(controls: boolean = false): any {
    const {requestType, requestClassification, licenseDurationType, description} = this;
    return {
      requestType: controls ? [requestType, [CustomValidators.required]] : requestType,
      requestClassification: controls ? [requestClassification, [CustomValidators.required]] : requestClassification,
      licenseDurationType: controls ? [licenseDurationType, [CustomValidators.required]] : licenseDurationType,
      description: controls ? [description, [CustomValidators.required]] : description,
    }
  }
}
