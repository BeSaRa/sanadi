import {CaseTypes} from '@app/enums/case-types.enum';
import {Cloneable} from '@models/cloneable';

export class NotificationParametersResponse extends Cloneable<NotificationParametersResponse> {
  caseId!: string;
  caseType!: CaseTypes;
  taskId!: string;

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
