import {TaskState} from '../enums/task-state';
import {Cloneable} from './cloneable';
import {InboxService} from '../services/inbox.service';
import {FactoryService} from '../services/factory.service';
import {Observable} from 'rxjs';
import {IBulkResult} from '../interfaces/ibulk-result';
import {DialogRef} from '../shared/models/dialog-ref';
import {BlobModel} from './blob-model';
import {WFResponseType} from '../enums/wfresponse-type.enum';

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

  claim(): Observable<IBulkResult> {
    return this.service.claimBulk([this.TKIID]);
  }

  manageAttachments(): DialogRef {
    return this.service.openDocumentDialog(this.PI_PARENT_CASE_ID, this.BD_CASE_TYPE);
  }

  manageRecommendations(): DialogRef {
    return this.service.openRecommendationDialog(this.PI_PARENT_CASE_ID, this.BD_CASE_TYPE);
  }

  manageComments(): DialogRef {
    return this.service.openCommentsDialog(this.PI_PARENT_CASE_ID, this.BD_CASE_TYPE);
  }

  viewLogs(): DialogRef {
    return this.service.openActionLogs(this.PI_PARENT_CASE_ID, this.BD_CASE_TYPE);
  }

  exportActions(): Observable<BlobModel> {
    return this.service.exportActions(this.PI_PARENT_CASE_ID, this.BD_CASE_TYPE);
  }

  exportModel(): Observable<BlobModel> {
    return this.service.exportModel(this.PI_PARENT_CASE_ID, this.BD_CASE_TYPE);
  }

  sendToUser(claimBefore: boolean = false): DialogRef {
    return this.service.sendToUser(this.TKIID, this.BD_CASE_TYPE, claimBefore, this);
  }

  sendToDepartment(claimBefore: boolean = false): DialogRef {
    return this.service.sendToDepartment(this.TKIID, this.BD_CASE_TYPE, claimBefore, this);
  }

  private actionOnTask(actionType: WFResponseType, claimBefore: boolean = false): DialogRef {
    return this.service.takeActionWithComment(this.TKIID, this.BD_CASE_TYPE, actionType, claimBefore, this);
  }


  complete(claimBefore: boolean = false): DialogRef {
    return this.actionOnTask(WFResponseType.COMPLETE, claimBefore);
  }

  approve(claimBefore: boolean = false): DialogRef {
    return this.actionOnTask(WFResponseType.APPROVE, claimBefore);
  }

  return(claimBefore: boolean = false): DialogRef {
    return this.actionOnTask(WFResponseType.RETURN, claimBefore);
  }

  close(claimBefore: boolean = false): DialogRef {
    return this.actionOnTask(WFResponseType.CLOSE, claimBefore);
  }

  reject(claimBefore: boolean = false): DialogRef {
    return this.actionOnTask(WFResponseType.REJECT, claimBefore);
  }
}
