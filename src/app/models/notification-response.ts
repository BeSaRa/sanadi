import {NotificationResponseInterceptor} from '@model-interceptors/notification-response-interceptor';
import {InterceptModel} from '@decorators/intercept-model';

const {send, receive} = new NotificationResponseInterceptor();

@InterceptModel({send, receive})
export class NotificationResponse {
  id!: number;
  title!: string;
  body!: string;
  status!: number;
  sendTo!: number;
  caseId!: number;
  parameters!: any;
  notificationType!: number;
}
