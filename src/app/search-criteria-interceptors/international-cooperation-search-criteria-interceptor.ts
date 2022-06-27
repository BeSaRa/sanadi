import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {InternationalCooperationSearchCriteria} from '../models/international-cooperation-search-criteria';
import { InternationalCooperationInterceptor } from "@app/model-interceptors/international-cooperation-interceptor";

export class InternationalCooperationSearchCriteriaInterceptor implements IModelInterceptor<InternationalCooperationSearchCriteria> {
  caseInterceptor: IModelInterceptor<any> = new InternationalCooperationInterceptor()
  receive(model: InternationalCooperationSearchCriteria): InternationalCooperationSearchCriteria {
    return model;
  }

  send(model: Partial<InternationalCooperationSearchCriteria>): Partial<InternationalCooperationSearchCriteria> {
    return model;
  }
}
