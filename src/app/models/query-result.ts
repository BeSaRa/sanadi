import {TaskState} from '../enums/task-state';
import {InboxService} from '@services/inbox.service';
import {FactoryService} from '@services/factory.service';
import {Observable} from 'rxjs';
import {IBulkResult} from '@contracts/ibulk-result';
import {DialogRef} from '../shared/models/dialog-ref';
import {BlobModel} from './blob-model';
import {WFResponseType} from '../enums/wfresponse-type.enum';
import {delay, map, take, tap} from 'rxjs/operators';
import {DialogService} from '@services/dialog.service';
import {ComponentType} from '@angular/cdk/overlay';
import {DynamicComponentService} from '@services/dynamic-component.service';
import {CaseViewerPopupComponent} from '../shared/popups/case-viewer-popup/case-viewer-popup.component';
import {IESComponent} from '@contracts/iescomponent';
import {IMenuItem} from '../modules/context-menu/interfaces/i-menu-item';
import {CaseModel} from './case-model';
import {OpenFrom} from '../enums/open-from.enum';
import {AdminResult} from './admin-result';
import {SearchableCloneable} from './searchable-cloneable';
import {ISearchFieldsMap} from '../types/types';
import {DatePipe} from '@angular/common';
import {LangService} from '@services/lang.service';
import {EmployeeService} from '@services/employee.service';
import {OperationTypes} from '../enums/operation-types.enum';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {WFActions} from '../enums/wfactions.enum';
import {LicenseApprovalModel} from '@app/models/license-approval-model';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {RiskStatus} from '@app/enums/risk-status';
import {EncryptionService} from '@app/services/encryption.service';
import {INavigatedItem} from '@app/interfaces/inavigated-item';
import {CaseTypes} from '@app/enums/case-types.enum';
import {CommonCaseStatus} from '@app/enums/common-case-status.enum';
import {infoSearchFields} from '@helpers/info-search-fields';
import {normalSearchFields} from '@helpers/normal-search-fields';

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
  TAD_DISPLAY_NAME!: keyof ILanguageKeys;
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
  BD_SUBJECT!: string;
  RISK_STATUS!: number;
  BD_IS_MAIN!: boolean;
  BD_IS_READ!: boolean;
  fromUserInfo!: AdminResult;
  orgInfo!: AdminResult;
  riskStatusInfo!: AdminResult;
  displayNameInfo!: AdminResult;
  teamInfo!: AdminResult;

  service!: InboxService;
  dialog!: DialogService;
  lang!: LangService;
  employeeService!: EmployeeService;
  encrypt!: EncryptionService;
  itemRoute!: string;
  itemDetails!: string;

  searchFields: ISearchFieldsMap<QueryResult> = {
    ...normalSearchFields(['BD_FULL_SERIAL', 'BD_SUBJECT']),
    ...infoSearchFields(['teamInfo', 'fromUserInfo', 'displayNameInfo']),
    ACTIVATED: (text, model) => {
      let date = (new DatePipe('en')).transform(model.ACTIVATED);
      return date ? date.toLowerCase().indexOf(text) !== -1 : false;
    },
    BD_CASE_TYPE: (text, model) => {
      let serviceKey = model.service.getService(model.BD_CASE_TYPE)?.serviceKey,
        serviceName = serviceKey ? model.lang.map[serviceKey] : '';
      return serviceName ? serviceName.toLowerCase().indexOf(text) !== -1 : false;
    },
    PI_CREATE: (text, model) => {
      let date = (new DatePipe('en')).transform(model.PI_CREATE);
      return date ? date.toLowerCase().indexOf(text) !== -1 : false;
    },
    PI_DUE: (text, model) => {
      let date = (new DatePipe('en')).transform(model.PI_DUE);
      return date ? date.toLowerCase().indexOf(text) !== -1 : false;
    },
    team: (text) => {
      // search if its team inbox
      if (this.ASSIGNED_TO_ROLE_DISPLAY_NAME) {
        return this.teamInfo ? this.teamInfo.getName().toLowerCase().indexOf(text) !== -1 : false;
      }
      return false;
    }
  };

  constructor() {
    super();
    this.service = FactoryService.getService('InboxService');
    this.dialog = FactoryService.getService('DialogService');
    this.lang = FactoryService.getService('LangService');
    this.employeeService = FactoryService.getService('EmployeeService');
    this.encrypt = new EncryptionService();
  }

  claim(): Observable<IBulkResult> {
    return this.service.claimBulk([this.TKIID], this.BD_CASE_TYPE);
  }

  release(): Observable<IBulkResult> {
    return this.service.releaseBulk([this.TKIID], this.BD_CASE_TYPE);
  }

  markAsRead(): Observable<IBulkResult> {
    return this.service.markAsReadUnreadBulk([this.TKIID], this.BD_CASE_TYPE, true);
  }

  markAsUnread(): Observable<IBulkResult> {
    return this.service.markAsReadUnreadBulk([this.TKIID], this.BD_CASE_TYPE, false);
  }

  manageAttachments(): DialogRef {
    return this.service.openDocumentDialog(this.PI_PARENT_CASE_ID, this.BD_CASE_TYPE, this);
  }

  manageRecommendations(): DialogRef {
    return this.service.openRecommendationDialog(this.PI_PARENT_CASE_ID, this.BD_CASE_TYPE);
  }

  manageComments(): DialogRef {
    return this.service.openCommentsDialog(this.PI_PARENT_CASE_ID, this.BD_CASE_TYPE);
  }

  viewLogs(): DialogRef {
    return this.service.openActionLogs(this.PI_PARENT_CASE_ID, this.BD_CASE_TYPE, this.BD_IS_MAIN);
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

  sendToStructureExpert(claimBefore: boolean = false): DialogRef {
    return this.service.sendToStructureExpert(this.TKIID, this.BD_CASE_TYPE, claimBefore, this);
  }

  sendToDevelopmentExpert(claimBefore: boolean = false): DialogRef {
    return this.service.sendToDevelopmentExpert(this.TKIID, this.BD_CASE_TYPE, claimBefore, this);
  }

  sendToDepartment(claimBefore: boolean = false): DialogRef {
    return this.service.sendToDepartment(this.TKIID, this.BD_CASE_TYPE, claimBefore, this);
  }

  sendToMultiDepartments(claimBefore: boolean = false): DialogRef {
    return this.service.sendToMultiDepartments(this.TKIID, this.BD_CASE_TYPE, claimBefore, this);
  }

  getAskSingleWFResponseByCaseType(caseType?: number): string {
    let servicesMap = {
      [CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL]: WFResponseType.INITIAL_EXTERNAL_OFFICE_SEND_TO_SINGLE_DEPARTMENT,
      [CaseTypes.PARTNER_APPROVAL]: WFResponseType.PARTNER_APPROVAL_SEND_TO_SINGLE_DEPARTMENT,
      [CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL]: WFResponseType.FINAL_EXTERNAL_OFFICE_SEND_TO_SINGLE_DEPARTMENT,
      [CaseTypes.INTERNAL_PROJECT_LICENSE]: WFResponseType.INTERNAL_PROJECT_SEND_TO_SINGLE_DEPARTMENT,
      [CaseTypes.COLLECTION_APPROVAL]: WFResponseType.COLLECTION_APPROVAL_SEND_TO_SINGLE_DEPARTMENT,
      [CaseTypes.COLLECTOR_LICENSING]: WFResponseType.COLLECTOR_LICENSING_SEND_TO_SINGLE_DEPARTMENT,
      [CaseTypes.URGENT_INTERVENTION_LICENSING]: WFResponseType.URGENT_INTERVENTION_LICENSE_SEND_TO_SINGLE_DEPARTMENT,
      [CaseTypes.FUNDRAISING_LICENSING]: WFResponseType.FUNDRAISING_LICENSE_SEND_TO_SINGLE_DEPARTMENT,
      [CaseTypes.GENERAL_PROCESS_NOTIFICATION]: WFResponseType.GENERAL_NOTIFICATION_SEND_TO_SINGLE_DEPARTMENTS,
    };

    if (!caseType) {
      caseType = this.BD_CASE_TYPE;
    }

    // @ts-ignore
    return servicesMap[caseType];
  }

  sendToSingleDepartment(_claimBefore: boolean = false): Observable<boolean> {
    let service = this.service.getService(this.BD_CASE_TYPE),
      taskName: string = this.getAskSingleWFResponseByCaseType();
    if (taskName.startsWith('ask:')) {
      taskName = taskName.split('ask:')[1];
    } else if (taskName.startsWith('askSingle:')) {
      taskName = taskName.split('askSingle:')[1];
    }
    return this.service.sendTaskToMultiple(this.getCaseId(), {taskName: taskName}, service);
  }

  sendToManager(claimBefore: boolean = false): DialogRef {
    return this.service.sendToManager(this.TKIID, this.BD_CASE_TYPE, claimBefore, this);
  }

  sendToGeneralManager(claimBefore: boolean = false): DialogRef {
    return this.service.sendToGeneralManager(this.TKIID, this.BD_CASE_TYPE, claimBefore, this);
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

  finalApprove(claimBefore: boolean = false): DialogRef {
    return this.actionOnTask(WFResponseType.FINAL_APPROVE, claimBefore);
  }

  askForConsultation(claimBefore: boolean = false): DialogRef {
    let response = this.getResponses().find(x => x.indexOf(WFResponseType.ASK_FOR_CONSULTATION) === 0);
    return this.actionOnTask(response as WFResponseType, claimBefore);
  }

  postpone(claimBefore: boolean = false): DialogRef {
    return this.actionOnTask(WFResponseType.POSTPONE, claimBefore);
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

  finalReject(claimBefore: boolean = false): DialogRef {
    return this.actionOnTask(WFResponseType.FINAL_REJECT, claimBefore);
  }

  returnToOrganization(claimBefore: boolean = false): DialogRef {
    return this.actionOnTask(WFResponseType.RETURN_TO_ORG, claimBefore);
  }

  open(actions: IMenuItem<QueryResult>[] = [], from: OpenFrom = OpenFrom.USER_INBOX, readonly: boolean = true): Observable<DialogRef> {
    const service = this.service.getService(this.BD_CASE_TYPE);
    const componentName = service.getCaseComponentName();
    const component: ComponentType<any> = DynamicComponentService.getComponent(componentName);
    let model: CaseModel<any, any>;
    return service.getTask(this.TKIID)
      .pipe(
        tap(task => model = task),
        map(_ => this.dialog.show(CaseViewerPopupComponent, {
          key: service.serviceKey,
          openedFrom: from,
          model: this,
          loadedModel: model,
          actions,
          componentService: service
        }, {fullscreen: false})),
        tap(ref => {
          const instance = ref.instance as unknown as CaseViewerPopupComponent;
          instance.viewInit
            .pipe(
              take(1),
              delay(0)
            )
            .subscribe(() => {
              instance.container.clear();
              const componentRef = instance.container.createComponent(component);
              const comInstance = componentRef.instance as unknown as IESComponent<CaseModel<any, any>>;
              comInstance.outModel = model;
              comInstance.fromDialog = true;
              comInstance.readonly = readonly;
              comInstance.operation = OperationTypes.UPDATE;
              comInstance.openFrom = from;
              comInstance.allowEditRecommendations = this.isAllowedToEditRecommendations(model, from);
              instance.component = comInstance;
            });
        })
      );
  }

  loadLicenseModel(): Observable<LicenseApprovalModel<any, any>> {
    const service = this.service.getService(this.BD_CASE_TYPE);
    return service.getTask(this.TKIID);
  }

  private isAllowedToEditRecommendations(model: CaseModel<any, any>, from: OpenFrom): boolean {
    return this.employeeService.isInternalUser() && (from === OpenFrom.USER_INBOX || (from === OpenFrom.SEARCH && model.canStart()) || (model.taskDetails.actions.indexOf(WFActions.ACTION_CANCEL_CLAIM) !== -1));
  }

  getStatusIcon(): string {
    return this.service.getService(this.BD_CASE_TYPE).getStatusIcon(this.BD_CASE_STATUS);
  }

  getCaseId(): any {
    return this.PI_PARENT_CASE_ID;
  }


  getCaseType(): number {
    return this.BD_CASE_TYPE;
  }

  getCaseStatus(): any {
    return this.BD_CASE_STATUS;
  }

  isFinalApproved(): any {
    return this.getCaseStatus() === CommonCaseStatus.FINAL_APPROVE;
  }

  isFinalNotification(): any {
    return this.getCaseStatus() === CommonCaseStatus.FINAL_NOTIFICATION;
  }

  isInitialApproved(): boolean {
    return this.getCaseStatus() === CommonCaseStatus.INITIAL_APPROVE;
  }

  isFinalRejection(): boolean {
    return this.getCaseStatus() === CommonCaseStatus.FINAL_REJECTION;
  }

  isTask(): boolean {
    return true;
  }

  isCase(): boolean {
    return false;
  }

  isReturned(): boolean {
    return this.BD_IS_RETURNED;
  }

  isDraft(): boolean {
    return this.BD_CASE_STATUS === CommonCaseStatus.DRAFT;
  }

  getRiskStatusColor(): string {
    const color: IKeyValue = {
      [RiskStatus.NORMAL]: 'text-success',
      [RiskStatus.AT_RISK]: 'text-warning',
      [RiskStatus.OVER_DUE]: 'text-danger'
    };

    return color[this.RISK_STATUS];
  }

  isRead(): boolean {
    return this.BD_IS_READ;
  }

  isMain(): boolean {
    return this.BD_IS_MAIN;
  }

  setItemRoute(): void {
    this.itemRoute = '/' + this.service.getServiceRoute(this.BD_CASE_TYPE) + '/service';
    this.itemDetails = this.encrypt.encrypt<INavigatedItem>({
      openFrom: !this.OWNER ? OpenFrom.TEAM_INBOX : OpenFrom.USER_INBOX,
      taskId: this.TKIID,
      caseId: this.PI_PARENT_CASE_ID,
      caseType: this.BD_CASE_TYPE
    });
  }

  getResponses(): string[] {
    return this.RESPONSES;
  }
}
