import { CaseModel } from "@app/models/case-model";
import { CollectionApprovalService } from "@app/services/collection-approval.service";
import { FactoryService } from "@app/services/factory.service";
import { AdminResult } from "./admin-result";
import { CaseTypes } from "@app/enums/case-types.enum";
import { CustomValidators } from "@app/validators/custom-validators";
import { CollectionItem } from "@app/models/collection-item";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { WFResponseType } from "@app/enums/wfresponse-type.enum";
import { mixinRequestType } from "@app/mixins/mixin-request-type";
import { HasRequestType } from "@app/interfaces/has-request-type";
import { mixinLicenseDurationType } from "@app/mixins/mixin-license-duration";
import { HasLicenseDurationType } from "@app/interfaces/has-license-duration-type";
import { ISearchFieldsMap } from "@app/types/types";
import { dateSearchFields } from "@app/helpers/date-search-fields";
import { normalSearchFields } from "@app/helpers/normal-search-fields";
import { infoSearchFields } from "@app/helpers/info-search-fields";
import { CollectionApprovalInterceptor } from "@app/model-interceptors/collection-approval-interceptor";
import { InterceptModel } from "@decorators/intercept-model";

const _RequestType = mixinLicenseDurationType(mixinRequestType(CaseModel));
const interceptor = new CollectionApprovalInterceptor();

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive
})
export class CollectionApproval extends _RequestType<CollectionApprovalService, CollectionApproval> implements HasRequestType, HasLicenseDurationType {
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

  searchFields: ISearchFieldsMap<CollectionApproval> = {
    ...normalSearchFields(['fullSerial', 'subject']),
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['creatorInfo', 'ouInfo', 'caseStatusInfo', 'requestClassificationInfo'])
  }

  constructor() {
    super();
    this.service = FactoryService.getService('CollectionApprovalService');
    this.finalizeSearchFields();
  }

  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }

  buildBasicInfo(controls: boolean = false): any {
    const { requestType, requestClassification, licenseDurationType } = this;
    return {
      requestType: controls ? [requestType, [CustomValidators.required]] : requestType,
      requestClassification: controls ? [requestClassification, [CustomValidators.required]] : requestClassification,
      licenseDurationType: controls ? [licenseDurationType, [CustomValidators.required]] : licenseDurationType
    }
  }

  buildExplanation(controls: boolean = false): any {
    const { description } = this;
    return {
      description: controls ? [description, [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : description,
    }
  }


  approve(): DialogRef {
    return this.service.approveTask(this, WFResponseType.APPROVE);
  }

  finalApprove(): DialogRef {
    return this.service.approveTask(this, WFResponseType.FINAL_APPROVE);
  }

  hasInvalidCollectionItems(): boolean {
    return !this.collectionItemList.length || this.collectionItemList.some((item) => !item.hasValidApprovalInfo());
  }
}
