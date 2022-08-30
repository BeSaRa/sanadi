import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {SearchUrgentInterventionAnnouncementCriteria} from '@app/models/search-urgent-intervention-announcement-criteria';
import {UrgentInterventionAnnouncementInterceptor} from '@app/model-interceptors/urgent-intervention-announcement-interceptor';

export class SearchUrgentInterventionAnnouncementCriteriaInterceptor implements IModelInterceptor<SearchUrgentInterventionAnnouncementCriteria> {
  caseInterceptor: IModelInterceptor<any> = new UrgentInterventionAnnouncementInterceptor();

  receive(model: SearchUrgentInterventionAnnouncementCriteria): SearchUrgentInterventionAnnouncementCriteria {
    return model;
  }

  send(model: Partial<SearchUrgentInterventionAnnouncementCriteria>): Partial<SearchUrgentInterventionAnnouncementCriteria> {
    return model;
  }
}
