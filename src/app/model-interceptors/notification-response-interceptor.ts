import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {NotificationResponse} from '@models/notification-response';
import {NotificationTypeResponse} from '@models/notification-type-response';
import {CommonUtils} from '@helpers/common-utils';

export class NotificationResponseInterceptor implements IModelInterceptor<NotificationResponse> {
  receive(model: NotificationResponse): NotificationResponse {
    model.parametersParsed = undefined;
    if (CommonUtils.isValidValue(model.parameters)) {
      try {
        let parametersParsed = JSON.parse(model.parameters);
        if (CommonUtils.isEmptyObject(parametersParsed)) {
          model.parametersParsed = undefined;
        } else {
          model.parametersParsed = new NotificationTypeResponse().clone(parametersParsed);
        }
      } catch (e) {
        model.parametersParsed = undefined;
      }
    }
    return model;
  }

  send(model: Partial<NotificationResponse>): Partial<NotificationResponse> {
    NotificationResponseInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<NotificationResponse>): void {
    delete model.parametersParsed;
  }
}
