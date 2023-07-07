import {CommonCaseStatus} from "@app/enums/common-case-status.enum";
import {TaskDetails} from "@app/models/task-details";
import {AdminResult} from "@app/models/admin-result";
import {EmployeeService} from "@services/employee.service";
import {InboxService} from "@services/inbox.service";
import {EncryptionService} from "@services/encryption.service";
import {Observable} from "rxjs";
import {BlobModel} from "@app/models/blob-model";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {IMenuItem} from "@app/modules/context-menu/interfaces/i-menu-item";
import {OpenFrom} from "@app/enums/open-from.enum";
import {LicenseApprovalModel} from "@app/models/license-approval-model";
import {IBulkResult} from "@contracts/ibulk-result";
import {UntypedFormGroup} from "@angular/forms";
import {OrganizationOfficer} from "@app/models/organization-officer";

export interface CaseModelContract<S, T> {
  id: string;
  serial: number;
  fullSerial: string;
  caseState: number;
  caseStatus: CommonCaseStatus;
  caseIdentifier: string;
  caseType: number;
  taskDetails: TaskDetails;
  caseStatusInfo: AdminResult;
  categoryInfo: AdminResult;
  recommendation: string;
  competentDepartmentID: number;
  competentDepartmentAuthName: string;
  assignDate: string;
  className: string;

  service: S;
  employeeService: EmployeeService;
  inboxService?: InboxService;

  itemRoute: string;
  itemDetails: string;
  encrypt: EncryptionService;
  organizationId: number;


  create(): Observable<T>

  update(): Observable<T>

  save(): Observable<T>

  commit(): Observable<T>

  draft(): Observable<T>

  start(): Observable<boolean>

  canDraft(): boolean

  canSave(): boolean

  canCommit(): boolean

  canStart(): boolean

  alreadyStarted(): boolean

  exportActions(): Observable<BlobModel>

  exportModel(): Observable<BlobModel>

  criteriaHasValues(): boolean

  filterSearchFields(fields?: string[]): Partial<CaseModelContract<any, any>>

  viewLogs(): DialogRef

  manageAttachments(): DialogRef

  manageRecommendations(onlyLogs: boolean): DialogRef

  manageComments(): DialogRef

  addFollowup(): DialogRef

  open(actions?: IMenuItem<CaseModelContract<any, any>>[], from?: OpenFrom.SEARCH): Observable<DialogRef>

  isTask(): boolean

  isCase(): boolean

  getStatusIcon(): string

  isCaseTypeEqual(caseType: number): boolean

  isReturned(): boolean

  getCaseType(): number

  getCaseStatus(): any

  isFinalApproved(): boolean

  isInitialApproved(): boolean

  getCaseId(): any

  getResponses(): string[]

  loadLicenseModel(): Observable<LicenseApprovalModel<any, any>>

  release(): Observable<IBulkResult>

  claim(): Observable<IBulkResult>

  setInboxService(service: InboxService): void

  sendToDepartment(): DialogRef

  sendToMultiDepartments(): DialogRef

  getAskSingleWFResponseByCaseType(caseType?: number): string


  sendToSingleDepartment(): DialogRef

  sendToUser(): DialogRef

  sendToStructureExpert(): DialogRef

  sendToDevelopmentExpert(): DialogRef

  sendToManager(): DialogRef

  sendToGeneralManager(): DialogRef

  complete(): DialogRef

  approve(): DialogRef

  initialApprove(): DialogRef

  finalApprove(): DialogRef

  organizationApprove(externalUserData: { form: UntypedFormGroup, organizationOfficers: OrganizationOfficer[] }): DialogRef

  validateApprove(): DialogRef

  askForConsultation(): DialogRef

  postpone(): DialogRef

  return(): DialogRef

  reject(): DialogRef

  organizationReject(): DialogRef

  validateReject(): DialogRef

  close(): DialogRef

  finalReject(): DialogRef

  returnToOrganization(): DialogRef

  returnToSpecificOrganization(): DialogRef

  finalNotification(): DialogRef

  isClaimed(): boolean

  addReleaseAction(): void

  addClaimAction(username: string): void

  openedFormInbox(): boolean

  openedFormTeamInbox(): boolean

  openedFromSearch(): boolean

  hasDetails(): boolean

  setItemRoute(): void
}
