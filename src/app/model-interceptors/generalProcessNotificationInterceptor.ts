import { IModelInterceptor } from '@contracts/i-model-interceptor';
import { GeneralProcessNotification } from '@app/models/general-process-notification';
import { DateUtils } from '@app/helpers/date-utils';
import { AdminResult } from '@app/models/admin-result';


export class GeneralProcessNotificationInterceptor implements IModelInterceptor<GeneralProcessNotification> {
  receive(model: GeneralProcessNotification): GeneralProcessNotification {
    model.subTeam && (model.subTeam = AdminResult.createInstance(model.subTeam));
    model.requestTypeInfo && (model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo));
    model.followUpDate = DateUtils.changeDateToDatepicker(model.followUpDate);

    return model;
  }
  send(model: any): GeneralProcessNotification {
    (model.followUpDate && (model.followUpDate = DateUtils.getDateStringFromDate(model.followUpDate)));
    GeneralProcessNotificationInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<GeneralProcessNotification>): void {
    delete model.subTeam;
    delete model.searchFields;
    delete model.requestTypeInfo;
  }
}
