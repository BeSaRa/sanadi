import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {PartnerApprovalSearchCriteria} from "@app/models/PartnerApprovalSearchCriteria";

export class PartnerApprovalSearchCriteriaInterceptor implements IModelInterceptor<PartnerApprovalSearchCriteria> {
  receive(model: PartnerApprovalSearchCriteria): PartnerApprovalSearchCriteria {
    return model;
  }

  send(model: Partial<PartnerApprovalSearchCriteria>): Partial<PartnerApprovalSearchCriteria> {
    return model;
  }
}
