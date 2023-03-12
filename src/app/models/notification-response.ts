import {NotificationResponseInterceptor} from '@model-interceptors/notification-response-interceptor';
import {InterceptModel} from '@decorators/intercept-model';
import {Cloneable} from '@models/cloneable';
import {NotificationTypesEnum} from '@app/enums/notification-types-enum';
import {NotificationParametersResponse} from '@models/notification-parameters-response';
import {CommonUtils} from '@helpers/common-utils';
import {CaseTypes} from '@app/enums/case-types.enum';
import {INavigatedItem} from '@contracts/inavigated-item';
import {OpenFrom} from '@app/enums/open-from.enum';
import {NotificationService} from '@services/notification.service';
import {FactoryService} from '@services/factory.service';
import {InboxService} from '@services/inbox.service';
import {EncryptionService} from '@services/encryption.service';

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
  service: NotificationService;
  parametersParsed?: NotificationParametersResponse;
  itemRoute!: string;
  itemDetails!: string;

  constructor() {
    super();
    this.service = FactoryService.getService('NotificationService');
  }

  getName(): string {
    return this.title;
  }

  private isValidNotificationData(): boolean {
    return CommonUtils.isValidValue(this.parametersParsed) && !CommonUtils.isEmptyObject(this.parametersParsed);
  }

  private isValidItemRouteData(): boolean {
    return this.isValidNotificationData() && CommonUtils.isValidValue(this.getCaseType()) && CommonUtils.isValidValue(this.getCaseId()) && CommonUtils.isValidValue(this.getTaskId());
  }

  // don't delete, its used in template
  isInformationTypeNotification(): boolean {
    return false;
  }

  // don't delete, its used in template
  isTerminatedNotification(): boolean {
    return this.notificationType === NotificationTypesEnum.TERMINATED;
  }

  // don't delete, its used in template
  isInboxNotification(): boolean {
    return this.notificationType === NotificationTypesEnum.INBOX;
  }

  getCaseId(): string {
    if (!this.isValidNotificationData()) {
      return '';
    }
    return this.parametersParsed!.getCaseId();
  }

  getCaseType(): CaseTypes | undefined {
    if (!this.isValidNotificationData()) {
      return undefined;
    }
    return this.parametersParsed!.getCaseType();
  }

  getTaskId(): string {
    if (!this.isValidNotificationData()) {
      return '';
    }
    return this.parametersParsed!.getTaskId();
  }

  open(): void {
    if (!this.isValidItemRouteData()) {
      console.error('Invalid item route');
      return;
    }
    this.service.openNotification(this);
  }

  openInfoNotification(): void {
    this.service.openInfoNotification(this);
  }

  setNotificationItemRoute(): void {
    if (!this.isValidItemRouteData()) {
      return;
    }
    let inboxService: InboxService = FactoryService.getService('InboxService');
    let encrypt: EncryptionService = FactoryService.getService('EncryptionService');
    const caseType: number = Number(this.getCaseType()!);
    this.itemRoute = '/' + inboxService.getServiceRoute(caseType) + '/service';
    this.itemDetails = encrypt.encrypt<INavigatedItem>({
      openFrom: OpenFrom.USER_INBOX,
      taskId: this.getTaskId(),
      caseId: this.getCaseId(),
      caseType: caseType
    });
  }
}
