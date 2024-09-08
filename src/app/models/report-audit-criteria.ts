import {CustomValidators} from '@app/validators/custom-validators';
import {InterceptModel} from '@decorators/intercept-model';
import {ReportAuditInterceptor} from '@model-interceptors/report-audit-interceptor';
import {IMyDateModel} from '@nodro7/angular-mydatepicker';

const { send, receive } = new ReportAuditInterceptor();
@InterceptModel({
  receive, send
})
export class ReportAuditCriteria {
  limit!: number;
  offset!: number;
  actionDateFrom!: string | IMyDateModel;
  acionDateTo!: string | IMyDateModel;
  gdxServiceId!: number;
  profileId!: number;
  orgUserId!: number;
  qId!: string;
  buildForm(withControls = true) {
    const {
      actionDateFrom,
      acionDateTo,
      gdxServiceId,
      profileId,
      orgUserId,
      qId,
    } = this;

    return {
      actionDateFrom: withControls ? [actionDateFrom, []] : actionDateFrom,
      acionDateTo: withControls ? [acionDateTo, []] : acionDateTo,
      gdxServiceId: withControls ? [gdxServiceId, []] : gdxServiceId,
      profileId: withControls ? [profileId, []] : profileId,
      orgUserId: withControls ? [orgUserId, []] : orgUserId,
      qId: withControls ? [qId, []] : qId,
    }
  }
}
