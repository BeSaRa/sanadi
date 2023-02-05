import {NotificationResponseInterceptor} from '@model-interceptors/notification-response-interceptor';
import {InterceptModel} from '@decorators/intercept-model';
import {Cloneable} from '@models/cloneable';

const {send, receive} = new NotificationResponseInterceptor();

@InterceptModel({send, receive})
export class NotificationResponse extends Cloneable<NotificationResponse> {
  id!: number;
  title!: string;
  body!: string;
  actionDate!: string;
  status!: number;
  sendTo!: number;
  parameters!: any;
  notificationType!: number;
  read!: boolean;

  getName(): string {
    return this.title;
  }
}
