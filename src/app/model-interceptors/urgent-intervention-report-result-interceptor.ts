import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {UrgentInterventionReportResult} from '@app/models/urgent-intervention-report-result';

export class UrgentInterventionReportResultInterceptor implements IModelInterceptor<UrgentInterventionReportResult>{
  receive(model: UrgentInterventionReportResult): UrgentInterventionReportResult {
    return model;
  }

  send(model: Partial<UrgentInterventionReportResult>): Partial<UrgentInterventionReportResult> {
    UrgentInterventionReportResultInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<UrgentInterventionReportResult>): void {

  }
}
