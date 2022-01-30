import {Cloneable} from './cloneable';
import {WFActions} from '@app/enums/wfactions.enum';

export class TaskDetails extends Cloneable<TaskDetails> {
  tkiid!: string;
  isAtRisk!: string;
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

  isClaimed(): boolean {
    return this.actions.includes(WFActions.ACTION_CANCEL_CLAIM);
  }

  getCaseId(): string {
    return this.parentCaseId;
  }
}
