import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {NotificationResponse} from '@models/notification-response';
import {NotificationParametersResponse} from '@models/notification-parameters-response';
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
          model.parametersParsed = new NotificationParametersResponse().clone(parametersParsed);
        }
      } catch (e) {
        model.parametersParsed = undefined;
      }
    }
    try {
      model.setNotificationItemRoute();
    } catch (e) {

    }
    return model;
  }

  send(model: Partial<NotificationResponse>): Partial<NotificationResponse> {
    NotificationResponseInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<NotificationResponse>): void {
    delete model.service;
    delete model.itemRoute;
    delete model.itemDetails;
    delete model.parametersParsed;
  }
}
