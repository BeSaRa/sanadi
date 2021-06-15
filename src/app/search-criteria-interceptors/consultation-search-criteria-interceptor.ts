import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {ConsultationSearchCriteria} from '../models/consultation-search-criteria';

export class ConsultationSearchCriteriaInterceptor implements IModelInterceptor<ConsultationSearchCriteria> {
  receive(model: ConsultationSearchCriteria): ConsultationSearchCriteria {
    return model;
  }

  send(model: Partial<ConsultationSearchCriteria>): Partial<ConsultationSearchCriteria> {
    return model;
  }
}
