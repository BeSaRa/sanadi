import {TaskState} from '../enums/task-state';
import {Cloneable} from './cloneable';
import {InboxService} from '../services/inbox.service';
import {FactoryService} from '../services/factory.service';
import {Observable} from 'rxjs';
import {IBulkResult} from '../interfaces/ibulk-result';

export class QueryResult extends Cloneable<QueryResult> {
  TKIID!: string;
  IS_AT_RISK!: boolean;
  PRIORITY!: 30;
  NAME!: string;
  OWNER!: string;
  STATE!: TaskState;
  STATUS!: string;
  CLOSED_BY!: null;
  ASSIGNED_TO_ROLE!: null;
  ASSIGNED_TO_ROLE_DISPLAY_NAME!: null;
  SENT_TIME!: null;
  TAD_DISPLAY_NAME!: string;
  TAD_DESCRIPTION!: null;
  DUE!: string;
  ACTIVATED!: string;
  AT_RISK_TIME!: string;
  READ_TIME!: string;
  PI_DISPLAY_NAME!: null;
  PI_NAME!: string;
  PI_STATE!: string;
  PI_STATUS!: string;
  PROCESS_APP_ACRONYM!: string;
  PT_PTID!: string;
  PT_NAME!: string;
  PI_PIID!: string;
  PROCESS_INSTANCEPIID!: string;
  ORIGINATOR!: string;
  BD_FULL_SERIAL!: string;
  BD_CASE_STATUS!: number;
  BD_CASE_TYPE!: number;
  BD_IS_RETURNED!: boolean;
  PI_PARENT_ACTIVITY_ID!: string;
  PI_CASE_FOLDER_ID!: string;
  PI_PARENT_CASE_ID!: string;
  PI_DUE!: string;
  PI_CREATE!: string;
  RESPONSES!: string [];
  service!: InboxService;

  constructor() {
    super();
    this.service = FactoryService.getService('InboxService');
  }

  claim() : Observable<IBulkResult> {
    return this.service.claimBulk([this.TKIID]);
  }
}
