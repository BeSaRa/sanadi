import {TaskState} from '../enums/task-state';
import {InboxService} from '../services/inbox.service';
import {FactoryService} from '../services/factory.service';
import {Observable} from 'rxjs';
import {IBulkResult} from '../interfaces/ibulk-result';
import {DialogRef} from '../shared/models/dialog-ref';
import {BlobModel} from './blob-model';
import {WFResponseType} from '../enums/wfresponse-type.enum';
import {delay, map, take, tap} from 'rxjs/operators';
import {DialogService} from '../services/dialog.service';
import {ComponentType} from '@angular/cdk/overlay';
import {DynamicComponentService} from '../services/dynamic-component.service';
import {CaseViewerPopupComponent} from '../shared/popups/case-viewer-popup/case-viewer-popup.component';
import {IESComponent} from '../interfaces/iescomponent';
import {IMenuItem} from '../modules/context-menu/interfaces/i-menu-item';
import {CaseModel} from './case-model';
import {OpenFrom} from '../enums/open-from.enum';
import {AdminResult} from './admin-result';
import {SearchableCloneable} from './searchable-cloneable';
import {ISearchFieldsMap} from '../types/types';
import {DatePipe} from '@angular/common';
import {LangService} from '../services/lang.service';

export class QueryResult extends SearchableCloneable<QueryResult> {
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

  fromUserInfo!: AdminResult;

  service!: InboxService;
  dialog!: DialogService;
  lang!: LangService;

  searchFields: ISearchFieldsMap<QueryResult> = {
    BD_FULL_SERIAL: 'BD_FULL_SERIAL',
    fromUserInfo: (text, model) => model.fromUserInfo && (model.fromUserInfo.getName() + '').toLowerCase().indexOf(text) !== -1,
    ACTIVATED: (text, model) => {
      let date = (new DatePipe('en')).transform(model.ACTIVATED);
      return date ? date.toLowerCase().indexOf(text) !== -1 : false;
    },
    BD_CASE_TYPE: (text, model) => {
      let local = model.lang.map[model.service.getService(model.BD_CASE_TYPE).serviceKey];
      return local ? local.toLowerCase().indexOf(text) !== -1 : false;
    },
    PI_CREATE: (text, model) => {
      let date = (new DatePipe('en')).transform(model.PI_CREATE);
      return date ? date.toLowerCase().indexOf(text) !== -1 : false;
    }
  };

  constructor() {
    super();
    this.service = FactoryService.getService('InboxService');
    this.dialog = FactoryService.getService('DialogService');
    this.lang = FactoryService.getService('LangService');
  }

  claim(): Observable<IBulkResult> {
    return this.service.claimBulk([this.TKIID]);
  }

  release(): Observable<IBulkResult> {
    return this.service.releaseBulk([this.TKIID]);
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

  sendToManager(claimBefore: boolean = false): DialogRef {
    return this.service.sendToManager(this.TKIID, this.BD_CASE_TYPE, claimBefore, this);
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

  open(actions: IMenuItem[] = [], from: OpenFrom = OpenFrom.USER_INBOX): Observable<DialogRef> {
    const service = this.service.getService(this.BD_CASE_TYPE);
    const componentName = service.getCaseComponentName();
    const component: ComponentType<any> = DynamicComponentService.getComponent(componentName);
    const cfr = this.service.getCFR();
    const factory = cfr.resolveComponentFactory(component);
    let model: CaseModel<any, any>;
    return service.getTask(this.TKIID)
      .pipe(
        tap(task => model = task),
        map(_ => this.dialog.show(CaseViewerPopupComponent, {key: service.serviceKey, openedFrom: from, model: this, actions})),
        tap(ref => {
          const instance = ref.instance as unknown as CaseViewerPopupComponent;
          instance.viewInit
            .pipe(
              take(1),
              delay(0)
            )
            .subscribe(() => {
              instance.container.clear();
              const componentRef = instance.container.createComponent(factory);
              const comInstance = componentRef.instance as unknown as IESComponent;
              comInstance.outModel = model;
              comInstance.fromDialog = true;
              comInstance.readonly = true;
              comInstance.allowEditRecommendations = (from === OpenFrom.USER_INBOX || (from === OpenFrom.SEARCH && model.canStart()));
              instance.component = comInstance;
            });
        })
      );
  }

  getStatusIcon(): string {
    return this.service.getService(this.BD_CASE_TYPE).getStatusIcon(this.BD_CASE_STATUS);
  }
}
