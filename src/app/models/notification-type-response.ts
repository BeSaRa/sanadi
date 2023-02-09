import {CaseTypes} from '@app/enums/case-types.enum';
import {Cloneable} from '@models/cloneable';
import {NotificationLocationEnum} from '@app/enums/notification-types-enum';
import {CommonUtils} from '@helpers/common-utils';

export class NotificationTypeResponse extends Cloneable<NotificationTypeResponse> {
  caseId!: string;
  caseType!: CaseTypes;
  taskId!: string;
  inbox!: string;

  isUserInboxNotification(): boolean {
    return !CommonUtils.isValidValue(this.inbox) ? false : this.inbox.toLowerCase() === NotificationLocationEnum.USER_INBOX.toLowerCase();
  }

  isTeamInboxNotification(): boolean {
    return !CommonUtils.isValidValue(this.inbox) ? false : this.inbox.toLowerCase() === NotificationLocationEnum.TEAM_INBOX.toLowerCase();
  }

  isTerminatedRequestNotification(): boolean {
    return !CommonUtils.isValidValue(this.inbox) ? false : this.inbox.toLowerCase() === NotificationLocationEnum.TERMINATED.toLowerCase();
  }

  getCaseId(): string {
    return this.caseId ?? '';
  }

  getCaseType(): CaseTypes | undefined {
    return this.caseType ?? undefined;
  }

  getTaskId(): string {
    return this.taskId ?? '';
  }
}
