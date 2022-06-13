import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {InquirySearchCriteria} from '@app/models/inquiry-search-criteria';
import { InquiryInterceptor } from "@app/model-interceptors/inquiry-interceptor";

export class InquirySearchCriteriaInterceptor implements IModelInterceptor<InquirySearchCriteria> {
  caseInterceptor: IModelInterceptor<any> = new InquiryInterceptor()
  receive(model: InquirySearchCriteria): InquirySearchCriteria {
    return model;
  }

  send(model: Partial<InquirySearchCriteria>): Partial<InquirySearchCriteria> {
    return model;
  }
}
