import { IModelInterceptor } from '@contracts/i-model-interceptor';
import { PartnerApprovalSearchCriteria } from "@app/models/PartnerApprovalSearchCriteria";
import { PartnerApprovalInterceptor } from "@app/model-interceptors/partner-approval-interceptor";

export class PartnerApprovalSearchCriteriaInterceptor implements IModelInterceptor<PartnerApprovalSearchCriteria> {
  caseInterceptor: IModelInterceptor<any> = new PartnerApprovalInterceptor()
  receive(model: PartnerApprovalSearchCriteria): PartnerApprovalSearchCriteria {
    return model;
  }

  send(model: Partial<PartnerApprovalSearchCriteria>): Partial<PartnerApprovalSearchCriteria> {
    return model;
  }
}
