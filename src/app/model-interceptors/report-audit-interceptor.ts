import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {ReportAuditCriteria} from '@models/report-audit-criteria';
import {DateUtils} from '@helpers/date-utils';
import {IMyDateModel} from '@nodro7/angular-mydatepicker';


export class ReportAuditInterceptor implements IModelInterceptor<ReportAuditCriteria> {
  send(model: Partial<ReportAuditCriteria>): Partial<ReportAuditCriteria> {
    model.acionDateTo = !model.acionDateTo ? '' : DateUtils.changeDateFromDatepicker(model.acionDateTo as IMyDateModel)?.toISOString();
    model.actionDateFrom = !model.actionDateFrom ? '' : DateUtils.changeDateFromDatepicker(model.actionDateFrom as IMyDateModel)?.toISOString();

    !model.orgUserId && delete model.orgUserId
    !model.qId && delete model.qId
    !model.gdxServiceId && delete model.gdxServiceId
    !model.profileId && delete model.profileId

    !model.orgUserId && delete model.orgUserId
    return model;
  }

  receive(model: ReportAuditCriteria): ReportAuditCriteria {
    return model;
  }
}
