import {NotificationResponseInterceptor} from '@model-interceptors/notification-response-interceptor';
import {InterceptModel} from '@decorators/intercept-model';
import {Cloneable} from '@models/cloneable';
import {NotificationTypesEnum} from '@app/enums/notification-types-enum';
import {NotificationParametersResponse} from '@models/notification-parameters-response';
import {CommonUtils} from '@helpers/common-utils';
import {CaseTypes} from '@app/enums/case-types.enum';

const {send, receive} = new NotificationResponseInterceptor();

@InterceptModel({send, receive})
export class NotificationResponse extends Cloneable<NotificationResponse> {
  id!: number;
  title!: string;
  body!: string;
  actionDate!: string;
  status!: number;
  sendTo!: number;
  parameters!: string;
  notificationType!: NotificationTypesEnum;
  read!: boolean;

  // extra properties
  parametersParsed?: NotificationParametersResponse;

  getName(): string {
    return this.title;
  }

  isInformationTypeNotification(): boolean {
    return this.isTerminatedNotification();
  }

  isTerminatedNotification(): boolean {
    return this.notificationType === NotificationTypesEnum.TERMINATED;
  }

  isUserInboxNotification(): boolean {
    return this.notificationType === NotificationTypesEnum.USER_INBOX;
  }

  isTeamInboxNotification(): boolean {
    return this.notificationType === NotificationTypesEnum.TEAM_INBOX;
  }

  getCaseId(): string {
    if (!CommonUtils.isValidValue(this.parametersParsed) || CommonUtils.isEmptyObject(this.parametersParsed)) {
      return '';
    }
    return this.parametersParsed!.getCaseId();
  }

  getCaseType(): CaseTypes | undefined {
    if (!CommonUtils.isValidValue(this.parametersParsed) || CommonUtils.isEmptyObject(this.parametersParsed)) {
      return undefined;
    }
    return this.parametersParsed!.getCaseType();
  }

  getTaskId(): string {
    if (!CommonUtils.isValidValue(this.parametersParsed) || CommonUtils.isEmptyObject(this.parametersParsed)) {
      return '';
    }
    return this.parametersParsed!.getTaskId();
  }
}
