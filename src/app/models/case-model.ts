import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {AdminResult} from './admin-result';
import {TaskDetails} from './task-details';
import {FileNetModel} from './FileNetModel';
import {Observable} from 'rxjs';
import {BlobModel} from './blob-model';
import {DialogRef} from '../shared/models/dialog-ref';
import {IMenuItem} from '../modules/context-menu/interfaces/i-menu-item';
import {ComponentType} from '@angular/cdk/overlay';
import {DynamicComponentService} from '@services/dynamic-component.service';
import {delay, map, take, tap} from 'rxjs/operators';
import {CaseViewerPopupComponent} from '../shared/popups/case-viewer-popup/case-viewer-popup.component';
import {IESComponent} from '@contracts/iescomponent';
import {OpenFrom} from '../enums/open-from.enum';
import {EmployeeService} from '@services/employee.service';
import {FactoryService} from '@services/factory.service';
import {OperationTypes} from '../enums/operation-types.enum';
import {ICaseModel} from "@app/interfaces/icase-model";
import {IBulkResult} from "@app/interfaces/ibulk-result";
import {InboxService} from "@app/services/inbox.service";
import {WFResponseType} from "@app/enums/wfresponse-type.enum";
import {LicenseApprovalModel} from "@app/models/license-approval-model";
import {INavigatedItem} from "@app/interfaces/inavigated-item";
import {EncryptionService} from "@app/services/encryption.service";
import {CaseTypes} from '@app/enums/case-types.enum';
import {BaseGenericEService} from "@app/generics/base-generic-e-service";
import {CommonCaseStatus} from '@app/enums/common-case-status.enum';
import {UntypedFormGroup} from '@angular/forms';
import {OrganizationOfficer} from '@app/models/organization-officer';
import {CaseModelContract} from "@contracts/case-model-contract";
import {CommonUtils} from '@helpers/common-utils';

export abstract class CaseModel<S extends BaseGenericEService<T>, T extends FileNetModel<T>> extends FileNetModel<T> implements ICaseModel<T>, CaseModelContract<S, T> {
  serial!: number;
  fullSerial!: string;
  caseState!: number;
  caseStatus!: CommonCaseStatus;
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
  organizationId!: number;
  submissionMechanism!: number;

  constructor() {
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
    return !CommonUtils.isValidValue(this.caseStatus) || this.caseStatus == CommonCaseStatus.DRAFT;
  }

  canSave(): boolean {
    return !CommonUtils.isValidValue(this.caseStatus) || this.caseStatus >= CommonCaseStatus.NEW;
  }

  /**
   * @description CommonCaseStatus.DRAFT
   */
  canCommit(): boolean {
    return this.caseStatus === CommonCaseStatus.DRAFT;
  }

  canStart(): boolean {
    return this.caseStatus === CommonCaseStatus.NEW;
  }

  alreadyStarted(): boolean {
    return this.caseStatus >= CommonCaseStatus.UNDER_PROCESSING;
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
        return (current === 'service') ? acc : {...acc, [current]: self[current]};
      }, {});
  }

  viewLogs(): DialogRef {
    return this.service.openActionLogs(this.id, this.caseType, this.isMain());
  }

  manageAttachments(): DialogRef {
    return this.service.openDocumentDialog(this.id, this.caseType, this);
  }

  manageRecommendations(onlyLogs: boolean = false): DialogRef {
    return this.service.openRecommendationDialog(this.id, onlyLogs);
  }

  manageComments(): DialogRef {
    return this.service.openCommentsDialog(this.id);
  }

  addFollowup(): DialogRef {
    return this.service.openFollowupsDialog(this);
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

  isRead(): boolean {
    return this.taskDetails.isRead;
  }

  isMain(): boolean {
    return this.taskDetails ? this.taskDetails.isMain : false;
  }

  getStatusIcon(): string {
    return this.service.getStatusIcon(this.caseStatus);
  }

  isCaseTypeEqual(caseType: number): boolean {
    return this.caseType === caseType;
  }

  isReturned(): boolean {
    return this.caseStatus === CommonCaseStatus.RETURNED;
  }

  isCancelled(): boolean {
    return this.caseStatus === CommonCaseStatus.CANCELLED;
  }

  isFinalRejection(): boolean {
    return this.caseStatus === CommonCaseStatus.FINAL_REJECTION;
  }

  getCaseType(): number {
    return this.caseType;
  }

  getCaseStatus(): any {
    return this.caseStatus;
  }

  isFinalApproved(): boolean {
    return this.caseStatus === CommonCaseStatus.FINAL_APPROVE;
  }

  isFinalNotification(): boolean {
    return this.caseStatus === CommonCaseStatus.FINAL_NOTIFICATION;
  }

  isInitialApproved(): boolean {
    return this.caseStatus === CommonCaseStatus.INITIAL_APPROVE;
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

  sendToSingleDepartment(): DialogRef {
    return this.inboxService!.sendToSingleDepartment(this.taskDetails.tkiid, this.caseType, this.getAskSingleWFResponseByCaseType(this.caseType) as WFResponseType, false, this);
  }

  getAskSingleWFResponseByCaseType(caseType?: number): string {
    let servicesMap = {
      [CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL]: WFResponseType.INITIAL_EXTERNAL_OFFICE_SEND_TO_SINGLE_DEPARTMENT,
      [CaseTypes.INTERNAL_PROJECT_LICENSE]: WFResponseType.INTERNAL_PROJECT_SEND_TO_SINGLE_DEPARTMENT,
      [CaseTypes.COLLECTION_APPROVAL]: WFResponseType.COLLECTION_APPROVAL_SEND_TO_SINGLE_DEPARTMENT,
      [CaseTypes.URGENT_INTERVENTION_LICENSING]: WFResponseType.URGENT_INTERVENTION_LICENSE_SEND_TO_SINGLE_DEPARTMENT,
      [CaseTypes.CUSTOMS_EXEMPTION_REMITTANCE]: WFResponseType.CUSTOMS_EXEMPTION_SEND_TO_SINGLE_DEPARTMENT,
      [CaseTypes.COLLECTOR_LICENSING]: WFResponseType.COLLECTOR_LICENSING_SEND_TO_SINGLE_DEPARTMENT,
      [CaseTypes.URGENT_INTERVENTION_CLOSURE]: WFResponseType.URGENT_INTERVENTION_CLOSURE_SEND_TO_SINGLE_DEPARTMENT,
      [CaseTypes.PROJECT_COMPLETION]: WFResponseType.PROJECT_COMPLETION_SEND_TO_SINGLE_DEPARTMENT,
      [CaseTypes.FUNDRAISING_LICENSING]: WFResponseType.FUNDRAISING_LICENSE_SEND_TO_SINGLE_DEPARTMENT,
      [CaseTypes.GENERAL_PROCESS_NOTIFICATION]: WFResponseType.GENERAL_NOTIFICATION_SEND_TO_SINGLE_DEPARTMENTS,
      [CaseTypes.TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD]: WFResponseType.TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD_SEND_TO_SINGLE_DEPARTMENT,
      [CaseTypes.NPO_MANAGEMENT]: WFResponseType.REVIEW_NPO_MANAGEMENT,
      [CaseTypes.PROJECT_FUNDRAISING]: WFResponseType.PROJECT_FUNDRAISING_SEND_TO_DEPARTMENTS,
      [CaseTypes.PROJECT_IMPLEMENTATION]: WFResponseType.PROJECT_IMPLEMENTATION_SEND_TO_SINGLE_DEPARTMENT,
      [CaseTypes.FINANCIAL_TRANSFERS_LICENSING]: WFResponseType.FINANCIAL_TRANSFER_SEND_TO_SINGLE_DEPARTMENT,
      [CaseTypes.URGENT_INTERVENTION_LICENSE_FOLLOWUP]: WFResponseType.URGENT_INTERVENTION_FOLLOWUP_SEND_TO_SINGLE_DEPARTMENT,
    }

    if (!caseType) {
      caseType = this.caseType;
    }

    // @ts-ignore
    return servicesMap[caseType];
  }

  getRejectCommentLabel(caseType: number): keyof ILanguageKeys {
    switch (caseType) {
      case CaseTypes.NPO_MANAGEMENT:
        return 'reject_reason'
      default:
        return 'comment'
    }
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
  sendToChief(): DialogRef {
    return this.inboxService!.sendToChief(this.taskDetails.tkiid, this.caseType, false, this);
  }

  sendToGeneralManager(): DialogRef {
    return this.inboxService!.sendToGeneralManager(this.taskDetails.tkiid, this.caseType, false, this);
  }
  sendToGM(): DialogRef {
    return this.inboxService!.sendToGM(this.taskDetails.tkiid, this.caseType, false, this);
  }
  complete(): DialogRef {
    return this.inboxService!.takeActionWithComment(this.taskDetails.tkiid, this.caseType, WFResponseType.COMPLETE, false, this);
  }

  approve(response?: WFResponseType): DialogRef {
    return this.inboxService!.takeActionWithComment(this.taskDetails.tkiid, this.caseType, response || WFResponseType.APPROVE, false, this);
  }

  initialApprove(): DialogRef {
    return this.inboxService!.takeActionWithComment(this.taskDetails.tkiid, this.caseType, WFResponseType.INITIAL_APPROVE, false, this);
  }

  finalApprove(): DialogRef {
    return this.inboxService!.takeActionWithComment(this.taskDetails.tkiid, this.caseType, WFResponseType.FINAL_APPROVE, false, this);
  }
  knew(): DialogRef {
    return this.inboxService!.takeActionWithComment(this.taskDetails.tkiid, this.caseType, WFResponseType.KNEW, false, this);
  }
  seen(): DialogRef {
    return this.inboxService!.seen(this.taskDetails.tkiid, this.caseType, false, this);
  }

  organizationApprove(externalUserData: { form: UntypedFormGroup, organizationOfficers: OrganizationOfficer[] }): DialogRef {
    return this.inboxService!.takeActionWithComment(this.taskDetails.tkiid, this.caseType, WFResponseType.ORGANIZATION_APPROVE, false, this);
  }

  validateApprove(): DialogRef {
    return this.inboxService!.takeActionWithComment(this.taskDetails.tkiid, this.caseType, WFResponseType.VALIDATE_APPROVE, false, this);
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
    return this.inboxService!.takeActionWithComment(this.taskDetails.tkiid, this.caseType, WFResponseType.REJECT, false, this, this.getRejectCommentLabel(this.caseType));
  }

  organizationReject(): DialogRef {
    return this.inboxService!.takeActionWithComment(this.taskDetails.tkiid, this.caseType, WFResponseType.ORGANIZATION_REJECT, false, this);
  }

  validateReject(): DialogRef {
    return this.inboxService!.takeActionWithComment(this.taskDetails.tkiid, this.caseType, WFResponseType.VALIDATE_REJECT, false, this);
  }

  close(): DialogRef {
    return this.inboxService!.takeActionWithComment(this.taskDetails.tkiid, this.caseType, WFResponseType.CLOSE, false, this);
  }

  markAsRead(): Observable<IBulkResult> {
    return this.service.markAsReadUnreadBulk([this.taskDetails.tkiid], true);
  }

  markAsUnread(): Observable<IBulkResult> {
    return this.service.markAsReadUnreadBulk([this.taskDetails.tkiid], false);
  }

  terminateTask(): Observable<boolean> {
    return this.inboxService!.terminateTask(this.taskDetails.tkiid, this.caseType);
  }

  finalReject(): DialogRef {
    return this.inboxService!.takeActionWithComment(this.taskDetails.tkiid, this.caseType, WFResponseType.FINAL_REJECT, false, this);
  }

  returnToOrganization(): DialogRef {
    return this.inboxService!.takeActionWithComment(this.taskDetails.tkiid, this.caseType, WFResponseType.RETURN_TO_ORG, false, this);
  }

  returnToSpecificOrganization(): DialogRef {
    return this.inboxService!.openReturnToSpecificOrganization(this.id, this);
  }

  returnToSpecificOrganizationWithComment(commentRequired = false): DialogRef {
    return this.inboxService!.openReturnToSpecificOrganizationWithComment(this.id, this, commentRequired);
  }

  finalNotification(): DialogRef {
    return this.inboxService!.takeActionWithComment(this.taskDetails.tkiid, this.caseType, WFResponseType.FINAL_NOTIFICATION, false, this);
  }

  organizationFinalApprove(_externalUserData: { form: UntypedFormGroup, organizationOfficers: OrganizationOfficer[] }): DialogRef {
    return this.inboxService!.takeActionWithComment(this.taskDetails.tkiid, this.caseType, WFResponseType.ORGANIZATION_FINAL_APPROVE, false, this);
  }

  organizationFinalReject(): DialogRef {
    return this.inboxService!.takeActionWithComment(this.taskDetails.tkiid, this.caseType, WFResponseType.ORGANIZATION_FINAL_REJECT, false, this);
  }

  isClaimed(): boolean {
    return this.taskDetails && this.taskDetails.isClaimed();
  }

  addReleaseAction(): void {
    this.taskDetails && this.taskDetails.addReleaseAction();
  }

  addClaimAction(username: string): void {
    this.taskDetails && this.taskDetails.addClaimAction(username);
  }

  openedFormInbox(): boolean {
    return this.taskDetails && !!this.taskDetails.owner;
  }

  openedFormTeamInbox(): boolean {
    return this.taskDetails && !this.taskDetails.owner;
  }

  openedFromSearch(): boolean {
    return !this.taskDetails || !this.taskDetails.tkiid;
  }

  hasDetails(): boolean {
    return !!(this.taskDetails && this.taskDetails.tkiid)
  }

  setItemRoute(): void {
    this.itemRoute = '/' + this.service.getMenuItem().path + '/service';
    this.itemDetails = this.encrypt.encrypt<INavigatedItem>({
      openFrom: OpenFrom.SEARCH,
      taskId: null,
      caseId: this.id,
      caseType: this.caseType
    });
  }
}
