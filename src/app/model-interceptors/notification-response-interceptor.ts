import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {NotificationResponse} from '@models/notification-response';

export class NotificationResponseInterceptor implements IModelInterceptor<NotificationResponse>{
  receive(model: NotificationResponse): NotificationResponse {
    return model;
  }

  send(model: Partial<NotificationResponse>): Partial<NotificationResponse> {
    return model;
  }
}
