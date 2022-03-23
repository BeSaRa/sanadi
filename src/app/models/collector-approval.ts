import {CaseModel} from '@app/models/case-model';
import {CollectorApprovalService} from '@app/services/collector-approval.service';
import {FactoryService} from '@app/services/factory.service';
import {CaseTypes} from '@app/enums/case-types.enum';
import {AdminResult} from '@app/models/admin-result';
import {CollectorItem} from '@app/models/collector-item';
import {CustomValidators} from '@app/validators/custom-validators';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {WFResponseType} from '@app/enums/wfresponse-type.enum';
import {mixinRequestType} from '@app/mixins/mixin-request-type';
import {HasRequestType} from '@app/interfaces/has-request-type';
import {mixinLicenseDurationType} from '@app/mixins/mixin-license-duration';
import {HasLicenseDurationType} from '@app/interfaces/has-license-duration-type';
import {ISearchFieldsMap} from '@app/types/types';
import {normalSearchFields} from '@app/helpers/normal-search-fields';
import {dateSearchFields} from '@app/helpers/date-search-fields';
import {infoSearchFields} from '@app/helpers/info-search-fields';
const _RequestType = mixinLicenseDurationType(mixinRequestType(CaseModel));

export class CollectorApproval extends _RequestType<CollectorApprovalService, CollectorApproval> implements HasRequestType, HasLicenseDurationType{
  serviceSteps: string[] = [];
  caseType: number = CaseTypes.COLLECTOR_LICENSING;
  organizationId!: number;
  chiefDecision!: number;
  chiefJustification!: string;
  description!: string;
  licenseStartDate!: string;
  licenseEndDate!: string;
  managerDecision!: number;
  managerJustification!: string;
  publicTerms!: string;
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
  searchFields: ISearchFieldsMap<CollectorApproval> = {
    ...normalSearchFields(['fullSerial']),
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['caseStatusInfo', 'creatorInfo', 'ouInfo'])
  }

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
