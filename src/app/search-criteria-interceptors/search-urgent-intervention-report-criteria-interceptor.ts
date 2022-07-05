import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {SearchUrgentInterventionReportCriteria} from '@app/models/search-urgent-intervention-report-criteria';
import {UrgentInterventionReportInterceptor} from '@app/model-interceptors/urgent-intervention-report-interceptor';

export class SearchUrgentInterventionReportCriteriaInterceptor implements IModelInterceptor<SearchUrgentInterventionReportCriteria> {
  caseInterceptor: IModelInterceptor<any> = new UrgentInterventionReportInterceptor();

  receive(model: SearchUrgentInterventionReportCriteria): SearchUrgentInterventionReportCriteria {
    return model;
  }

  send(model: Partial<SearchUrgentInterventionReportCriteria>): Partial<SearchUrgentInterventionReportCriteria> {
    return model;
  }
}
