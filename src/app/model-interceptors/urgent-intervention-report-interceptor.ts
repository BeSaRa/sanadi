import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {UrgentInterventionReport} from '@app/models/urgent-intervention-report';
import {AdminResult} from '@app/models/admin-result';
import {DateUtils} from '@helpers/date-utils';

export class UrgentInterventionReportInterceptor implements IModelInterceptor<UrgentInterventionReport>{
  receive(model: UrgentInterventionReport): UrgentInterventionReport {
    model.statusInfo && (model.statusInfo = AdminResult.createInstance(model.statusInfo));
    model.executionDateString = DateUtils.getDateStringFromDate(model.executionDate);
    return model;
  }

  send(model: Partial<UrgentInterventionReport>): Partial<UrgentInterventionReport> {
    UrgentInterventionReportInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<UrgentInterventionReport>): void {
    delete model.service;
    delete model.urgentInterventionLicenseFollowupService;
    delete model.langService;
    delete model.searchFields;
    delete model.statusInfo;
    delete model.executionDateString;
  }
}
