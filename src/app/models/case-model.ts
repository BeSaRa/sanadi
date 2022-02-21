import {AdminResult} from './admin-result';
import {TaskDetails} from './task-details';
import {FileNetModel} from './FileNetModel';
import {EServiceGenericService} from '../generics/e-service-generic-service';
import {Observable} from 'rxjs';
import {CaseStatus} from '../enums/case-status.enum';
import {BlobModel} from './blob-model';
import {DialogRef} from '../shared/models/dialog-ref';
import {IMenuItem} from '../modules/context-menu/interfaces/i-menu-item';
import {ComponentType} from '@angular/cdk/overlay';
import {DynamicComponentService} from '../services/dynamic-component.service';
import {delay, map, take, tap} from 'rxjs/operators';
import {CaseViewerPopupComponent} from '../shared/popups/case-viewer-popup/case-viewer-popup.component';
import {IESComponent} from '../interfaces/iescomponent';
import {OpenFrom} from '../enums/open-from.enum';
import {EmployeeService} from '../services/employee.service';
import {FactoryService} from '../services/factory.service';
import {OperationTypes} from '../enums/operation-types.enum';
import {ICaseModel} from "@app/interfaces/icase-model";
import {IBulkResult} from "@app/interfaces/ibulk-result";
import {InboxService} from "@app/services/inbox.service";
import {WFResponseType} from "@app/enums/wfresponse-type.enum";
import {LicenseApprovalModel} from "@app/models/license-approval-model";
import {INavigatedItem} from "@app/interfaces/inavigated-item";
import {EncryptionService} from "@app/services/encryption.service";

export abstract class CaseModel<S extends EServiceGenericService<T>, T extends FileNetModel<T>> extends FileNetModel<T> implements ICaseModel <T> {
  serial!: number;
  fullSerial!: string;
  caseState!: number;
  caseStatus!: CaseStatus;
  caseIdentifier!: string;
  caseType!: number;
  taskDetails!: TaskDetails;
  caseStatusInfo!: AdminResult;
  categoryInfo!: AdminResult;
  recommendation!: string;
  competentDepartmentID!: number;
  competentDepartmentAuthName!: string;
  assignDate!: string;
  className!: string;

  abstract service: S;
  employeeService: EmployeeService;
  inboxService?: InboxService;

  itemRoute: string = '';
  itemDetails: string = '';
  encrypt!: EncryptionService;

  protected constructor() {
    super();
    this.employeeService = FactoryService.getService('EmployeeService');
    this.encrypt = new EncryptionService();
  }

  create(): Observable<T> {
    return this.service.create(this as unknown as T);
  }

  update(): Observable<T> {
    return this.service.update(this as unknown as T);
  }

  save(): Observable<T> {
    return this.id ? this.update() : this.create();
  }

  commit(): Observable<T> {
    return this.service.commit(this as unknown as T);
  }

  draft(): Observable<T> {
    return this.service.draft(this as unknown as T);
  }

  start(): Observable<boolean> {
    return this.service.start(this.id);
  }

  canDraft(): boolean {
    return !this.caseStatus || this.caseStatus <= CaseStatus.DRAFT;
  }

  canSave(): boolean {
    return !this.caseStatus || this.caseStatus >= CaseStatus.CREATED;
  }

  /**
   * @description CaseStatus.DRAFT
   */
  canCommit(): boolean {
    return this.caseStatus === CaseStatus.DRAFT;
  }

  canStart(): boolean {
    return this.caseStatus === CaseStatus.CREATED;
  }

  alreadyStarted(): boolean {
    return this.caseStatus >= CaseStatus.STARTED;
  }

  exportActions(): Observable<BlobModel> {
    return this.service.exportActions(this.id);
  }

  exportModel(): Observable<BlobModel> {
    return this.service.exportModel(this.id);
  }

  criteriaHasValues(): boolean {
    return !!Object.keys(this.filterSearchFields()).length;
  }

  filterSearchFields(fields?: string[]): Partial<CaseModel<any, any>> {
    const self = this as unknown as any;
    return Object.keys(this).filter((key) => (self[key] !== '' && self[key] !== null))
      .filter(field => fields ? fields.indexOf(field) !== -1 : field)
      .reduce((acc, current) => {
        return (current === 'service' || current === 'caseType') ? acc : {...acc, [current]: self[current]};
      }, {});
  }

  viewLogs(): DialogRef {
    return this.service.openActionLogs(this.id);
  }

  manageAttachments(): DialogRef {
    return this.service.openDocumentDialog(this.id, this.caseType);
  }

  manageRecommendations(onlyLogs: boolean = false): DialogRef {
    return this.service.openRecommendationDialog(this.id, onlyLogs);
  }

  manageComments(): DialogRef {
    return this.service.openCommentsDialog(this.id);
  }

  open(actions?: IMenuItem<CaseModel<any, any>>[], from: OpenFrom = OpenFrom.SEARCH): Observable<DialogRef> {
    const componentName = this.service.getCaseComponentName();
    const component: ComponentType<any> = DynamicComponentService.getComponent(componentName);
    let model: CaseModel<any, any>;
    return this.service.getById(this.id)
      .pipe(
        tap((task: any) => model = task),
        map(_ => this.service.dialog.show(CaseViewerPopupComponent, {
          key: this.service.serviceKey,
          openedFrom: from,
          model: model,
          loadedModel: model,
          actions,
          componentService: this.service
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
              comInstance.readonly = !model.canStart();
              comInstance.operation = OperationTypes.UPDATE;
              comInstance.openFrom = from;
              comInstance.allowEditRecommendations = (from === OpenFrom.USER_INBOX || (from === OpenFrom.SEARCH && model.canStart())) && this.employeeService.isInternalUser();
              instance.component = comInstance;
            });
        })
      );
  }

  isTask(): boolean {
    return false;
  }

  isCase(): boolean {
    return true;
  }

  getStatusIcon(): string {
    return this.service.getStatusIcon(this.caseStatus);
  }

  isCaseTypeEqual(caseType: number): boolean {
    return this.caseType === caseType;
  }

  isReturned(): boolean {
    return this.caseStatus === this.service.caseStatusEnumMap[this.caseType].RETURNED;
  }

  getCaseType(): number {
    return this.caseType;
  }

  getCaseStatus(): any {
    return this.caseStatus;
  }

  isFinalApproved(): boolean {
    return this.caseStatus === this.service.caseStatusEnumMap[this.caseType].FINAL_APPROVE;
  }

  getCaseId(): any {
    return this.id;
  }

  getResponses(): string[] {
    return this.taskDetails?.responses || [];
  }

  loadLicenseModel(): Observable<LicenseApprovalModel<any, any>> {
    return this.service.getTask(this.taskDetails.tkiid) as unknown as Observable<LicenseApprovalModel<any, any>>;
  }

  release(): Observable<IBulkResult> {
    return this.service.releaseBulk([this.taskDetails.tkiid]);
  }

  claim(): Observable<IBulkResult> {
    return this.service.claimBulk([this.taskDetails.tkiid]);
  }

  setInboxService(service: InboxService): void {
    this.inboxService = service;
  }

  sendToDepartment(): DialogRef {
    return this.inboxService!.sendToDepartment(this.taskDetails.tkiid, this.caseType, false, this);
  }

  sendToMultiDepartments(): DialogRef {
    return this.inboxService!.sendToMultiDepartments(this.taskDetails.tkiid, this.caseType, false, this);
  }

  sendToSupervisionAndControlDepartment(): Observable<any> {
    let taskName: string = WFResponseType.INTERNAL_PROJECT_SEND_TO_SINGLE_DEPARTMENT;
    if (taskName.startsWith('ask:')) {
      taskName = taskName.split('ask:')[1];
    } else if (taskName.startsWith('askSingle:')) {
      taskName = taskName.split('askSingle:')[1];
    }
    return this.inboxService!.sendTaskToMultiple(this.getCaseId(), {taskName: taskName}, this.service);
  }

  sendToUser(): DialogRef {
    return this.inboxService!.sendToUser(this.taskDetails.tkiid, this.caseType, false, this);
  }

  sendToStructureExpert(): DialogRef {
    return this.inboxService!.sendToStructureExpert(this.taskDetails.tkiid, this.caseType, false, this);
  }

  sendToDevelopmentExpert(): DialogRef {
    return this.inboxService!.sendToDevelopmentExpert(this.taskDetails.tkiid, this.caseType, false, this);
  }

  sendToManager(): DialogRef {
    return this.inboxService!.sendToManager(this.taskDetails.tkiid, this.caseType, false, this);
  }

  sendToGeneralManager(): DialogRef {
    return this.inboxService!.sendToGeneralManager(this.taskDetails.tkiid, this.caseType, false, this);
  }

  complete(): DialogRef {
    return this.inboxService!.takeActionWithComment(this.taskDetails.tkiid, this.caseType, WFResponseType.COMPLETE, false, this);
  }

  approve(): DialogRef {
    return this.inboxService!.takeActionWithComment(this.taskDetails.tkiid, this.caseType, WFResponseType.APPROVE, false, this);
  }

  finalApprove(): DialogRef {
    return this.inboxService!.takeActionWithComment(this.taskDetails.tkiid, this.caseType, WFResponseType.FINAL_APPROVE, false, this);
  }

  askForConsultation(): DialogRef {
    let actionType = this.getResponses().find(x => x.indexOf(WFResponseType.ASK_FOR_CONSULTATION) === 0);
    return this.inboxService!.takeActionWithComment(this.taskDetails.tkiid, this.caseType, actionType as WFResponseType, false, this);
  }

  postpone(): DialogRef {
    return this.inboxService!.takeActionWithComment(this.taskDetails.tkiid, this.caseType, WFResponseType.POSTPONE, false, this);
  }

  return(): DialogRef {
    return this.inboxService!.takeActionWithComment(this.taskDetails.tkiid, this.caseType, WFResponseType.RETURN, false, this);
  }

  reject(): DialogRef {
    return this.inboxService!.takeActionWithComment(this.taskDetails.tkiid, this.caseType, WFResponseType.REJECT, false, this);
  }

  close(): DialogRef {
    return this.inboxService!.takeActionWithComment(this.taskDetails.tkiid, this.caseType, WFResponseType.CLOSE, false, this);
  }

  finalReject(): DialogRef {
    return this.inboxService!.takeActionWithComment(this.taskDetails.tkiid, this.caseType, WFResponseType.FINAL_REJECT, false, this);
  }

  returnToOrganization(): DialogRef {
    return this.inboxService!.takeActionWithComment(this.taskDetails.tkiid, this.caseType, WFResponseType.RETURN_TO_ORG, false, this);
  }

  setItemRoute(): void {
    this.itemRoute = '/' + this.service.getMenuItem().path;
    this.itemDetails = this.encrypt.encrypt<INavigatedItem>({
      openFrom: OpenFrom.SEARCH,
      taskId: null,
      caseId: this.id,
      caseType: this.caseType
    });
  }
}
