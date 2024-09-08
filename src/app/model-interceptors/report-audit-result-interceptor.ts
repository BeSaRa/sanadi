import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {ReportAuditResult} from '@models/report-audit-result';
import {AdminResult} from '@models/admin-result';

export class ReportAuditResultInterceptor implements IModelInterceptor<ReportAuditResult> {
  send(model: Partial<ReportAuditResult>): Partial<ReportAuditResult> {
      return model;
  }

  receive(model: ReportAuditResult): ReportAuditResult {
    model.benNationalityInfo && (model.benNationalityInfo = AdminResult.createInstance(model.benNationalityInfo));
    model.gdxServiceInfo && (model.gdxServiceInfo = AdminResult.createInstance(model.gdxServiceInfo));
    model.orgUserInfo && (model.orgUserInfo = AdminResult.createInstance(model.orgUserInfo));
    model.profileInfo && (model.profileInfo = AdminResult.createInstance(model.profileInfo));

    return model;
  }
}
