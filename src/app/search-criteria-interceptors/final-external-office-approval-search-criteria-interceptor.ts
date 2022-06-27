import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {FinalExternalOfficeApprovalSearchCriteria} from '@app/models/final-external-office-approval-search-criteria';
import {
  FinalExternalOfficeApprovalInterceptor
} from "@app/model-interceptors/final-external-office-approval-interceptor";

export class FinalExternalOfficeApprovalSearchCriteriaInterceptor implements IModelInterceptor<FinalExternalOfficeApprovalSearchCriteria> {
  caseInterceptor: IModelInterceptor<any> = new FinalExternalOfficeApprovalInterceptor()
  receive(model: FinalExternalOfficeApprovalSearchCriteria): FinalExternalOfficeApprovalSearchCriteria {
    return model;
  }

  send(model: Partial<FinalExternalOfficeApprovalSearchCriteria>): Partial<FinalExternalOfficeApprovalSearchCriteria> {
    return model;
  }
}
