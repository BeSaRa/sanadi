import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {ConsultationSearchCriteria} from '../models/consultation-search-criteria';
import { ConsultationInterceptor } from "@app/model-interceptors/consultation-interceptor";

export class ConsultationSearchCriteriaInterceptor implements IModelInterceptor<ConsultationSearchCriteria> {
  caseInterceptor: IModelInterceptor<any> = new ConsultationInterceptor()
  receive(model: ConsultationSearchCriteria): ConsultationSearchCriteria {
    return model;
  }

  send(model: Partial<ConsultationSearchCriteria>): Partial<ConsultationSearchCriteria> {
    return model;
  }
}
