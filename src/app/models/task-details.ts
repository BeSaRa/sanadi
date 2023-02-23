import {Cloneable} from './cloneable';
import {WFActions} from '@app/enums/wfactions.enum';
import {AdminResult} from "@app/models/admin-result";

export class TaskDetails extends Cloneable<TaskDetails> {
  tkiid!: string;
  isAtRisk!: string;
  isMain!: boolean;
  isRead!: boolean;
  priority!: number;
  name!: string;
  displayName!: string;
  owner!: string;
  state!: string;
  status!: string;
  isReturned!: boolean;
  closeByUser!: string;
  assignedTo!: string;
  assignedToType!: string[];
  assignedToDisplayName!: string;
  activationTime!: string;
  atRiskTime!: string;
  dueTime!: string;
  clientTypes!: any;
  completionTime!: string;
  data!: any;
  description!: string;
  teamDisplayName!: string;
  lastModificationTime!: string;
  originator!: string;
  priorityName!: string;
  processData!: any;
  nextTaskId!: string[];
  collaboration!: any;
  startTime!: string;
  tktid!: string;
  piid!: string;
  processInstanceName!: string;
  parentCaseId!: string;
  responses!: string[];
  actions!: string[];
  activityProperties!: any;

  fromUserInfo!: AdminResult;

  isClaimed(): boolean {
    return this.actions?.includes(WFActions.ACTION_CANCEL_CLAIM);
  }

  isNotClaimed(): boolean {
    return this.actions.includes(WFActions.ACTION_CLAIM);
  }

  getCaseId(): string {
    return this.parentCaseId;
  }

  addReleaseAction(): void {
    this.actions = this.actions.filter(action => action !== WFActions.ACTION_CANCEL_CLAIM).concat(WFActions.ACTION_CLAIM);
    this.owner = '';
  }

  addClaimAction(username?: string): void {
    this.actions = this.actions.filter(action => action !== WFActions.ACTION_CLAIM).concat(WFActions.ACTION_CANCEL_CLAIM);
    username && (this.owner = username)
  }
}
