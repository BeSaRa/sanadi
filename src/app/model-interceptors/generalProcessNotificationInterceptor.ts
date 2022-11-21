import { AdminResult } from './../models/admin-result';
import { IModelInterceptor } from '@contracts/i-model-interceptor';
import { GeneralProcessNotification } from '@app/models/general-process-notification';


export class GeneralProcessNotificationInterceptor implements IModelInterceptor<GeneralProcessNotification> {
  receive(model: GeneralProcessNotification): GeneralProcessNotification {
    model.subTeam && (model.subTeam = AdminResult.createInstance(model.subTeam));
    model.requestTypeInfo && (model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo));

    return model;
  }
  send(model: any): GeneralProcessNotification {

    GeneralProcessNotificationInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<GeneralProcessNotification>): void {
    delete model.subTeam;
    delete model.searchFields;
    delete model.requestTypeInfo;
  }
}
