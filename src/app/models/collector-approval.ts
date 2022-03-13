import {CaseModel} from '@app/models/case-model';
import {CollectorApprovalService} from '@app/services/collector-approval.service';
import {FactoryService} from '@app/services/factory.service';
import {CaseTypes} from '@app/enums/case-types.enum';
import {AdminResult} from '@app/models/admin-result';
import {CollectorItem} from '@app/models/collector-item';
import {CustomValidators} from '@app/validators/custom-validators';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {WFResponseType} from '@app/enums/wfresponse-type.enum';

export class CollectorApproval extends CaseModel<CollectorApprovalService, CollectorApproval> {

  serviceSteps: string[] = [];
  caseType: number = CaseTypes.COLLECTOR_LICENSING;
  organizationId!: number;
  chiefDecision!: number;
  chiefJustification!: string;
  description!: string;
  licenseDurationType!: number;
  licenseStartDate!: string;
  licenseEndDate!: string;
  managerDecision!: number;
  managerJustification!: string;
  publicTerms!: string;
  requestType!: number;
  reviewerDepartmentDecision!: number;
  reviewerDepartmentJustification!: string;
  secondSpecialistDecision!: number;
  secondSpecialistJustification!: string;
  specialistDecision!: number;
  specialistJustification!: string;
  subject!: string;
  inRenewalPeriod!: boolean;
  collectorItemList: CollectorItem[] = [];
  managerDecisionInfo!: AdminResult;
  reviewerDepartmentDecisionInfo!: AdminResult;
  specialistDecisionInfo!: AdminResult;
  secondSpecialistDecisionInfo!: AdminResult;
  chiefDecisionInfo!: AdminResult;
  requestTypeInfo!: AdminResult;
  requestClassificationInfo!: AdminResult;
  licenseDurationTypeInfo!: AdminResult;
  organizationCode!: string;

  service: CollectorApprovalService;

  constructor() {
    super();
    this.service = FactoryService.getService('CollectorApprovalService');
  }

  buildBasicInfo(controls: boolean = false): any {
    const {requestType, licenseDurationType} = this;
    return {
      requestType: controls ? [requestType, [CustomValidators.required]] : requestType,
      licenseDurationType: controls ? [licenseDurationType, [CustomValidators.required]] : licenseDurationType
    }
  }

  buildExplanation(controls: boolean = false): any {
    const {description} = this;
    return {
      description: controls ? [description, [CustomValidators.required]] : description,
    }
  }

  approve(): DialogRef {
    return this.service.approveTask(this, WFResponseType.APPROVE);
  }

  finalApprove(): DialogRef {
    return this.service.approveTask(this, WFResponseType.FINAL_APPROVE);
  }

  hasInvalidCollectorItems(): boolean {
    return !this.collectorItemList.length || this.collectorItemList.some((item) => !item.hasValidApprovalInfo());
  }
}
