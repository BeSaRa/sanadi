import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {FinalExternalOfficeApprovalSearchCriteria} from '@app/models/final-external-office-approval-search-criteria';

export class FinalExternalOfficeApprovalSearchCriteriaInterceptor implements IModelInterceptor<FinalExternalOfficeApprovalSearchCriteria> {
  receive(model: FinalExternalOfficeApprovalSearchCriteria): FinalExternalOfficeApprovalSearchCriteria {
    return model;
  }

  send(model: Partial<FinalExternalOfficeApprovalSearchCriteria>): Partial<FinalExternalOfficeApprovalSearchCriteria> {
    return model;
  }
}
