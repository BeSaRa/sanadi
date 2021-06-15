import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {InternationalCooperationSearchCriteria} from '../models/international-cooperation-search-criteria';

export class InternationalCooperationSearchCriteriaInterceptor implements IModelInterceptor<InternationalCooperationSearchCriteria> {
  receive(model: InternationalCooperationSearchCriteria): InternationalCooperationSearchCriteria {
    return model;
  }

  send(model: Partial<InternationalCooperationSearchCriteria>): Partial<InternationalCooperationSearchCriteria> {
    return model;
  }
}
