import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {InquirySearchCriteria} from '../models/inquiry-search-criteria';

export class InquirySearchCriteriaInterceptor implements IModelInterceptor<InquirySearchCriteria> {
  receive(model: InquirySearchCriteria): InquirySearchCriteria {
    return model;
  }

  send(model: Partial<InquirySearchCriteria>): Partial<InquirySearchCriteria> {
    return model;
  }
}
