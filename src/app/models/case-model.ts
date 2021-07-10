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

export abstract class CaseModel<S extends EServiceGenericService<T>, T extends FileNetModel<T>> extends FileNetModel<T> {
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

  service!: S;
  employeeService: EmployeeService;

  protected constructor() {
    super();
    this.employeeService = FactoryService.getService('EmployeeService');
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
    return this.caseStatus >= CaseStatus.CREATED;
  }

  canCommit(): boolean {
    return this.caseStatus === CaseStatus.DRAFT;
  }

  canStart(): boolean {
    return this.caseStatus < CaseStatus.STARTED && this.caseStatus === CaseStatus.CREATED;
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

  filterSearchFields(): Partial<CaseModel<any, any>> {
    const self = this as unknown as any;
    return Object.keys(this).filter((key) => (self[key] !== '' && self[key] !== null)).reduce((acc, current) => {
      return (current === 'service' || current === 'caseType') ? acc : {...acc, [current]: self[current]};
    }, {});
  }

  viewLogs(): DialogRef {
    return this.service.openActionLogs(this.id);
  }

  manageAttachments(): DialogRef {
    return this.service.openDocumentDialog(this.id);
  }

  manageRecommendations(onlyLogs: boolean = false): DialogRef {
    return this.service.openRecommendationDialog(this.id, onlyLogs);
  }

  manageComments(): DialogRef {
    return this.service.openCommentsDialog(this.id);
  }

  open(actions?: IMenuItem[], from: OpenFrom = OpenFrom.SEARCH): Observable<DialogRef> {
    const componentName = this.service.getCaseComponentName();
    const component: ComponentType<any> = DynamicComponentService.getComponent(componentName);
    const cfr = this.service.getCFR();
    const factory = cfr.resolveComponentFactory(component);
    let model: CaseModel<any, any>;
    return this.service.getById(this.id)
      .pipe(
        tap((task: any) => model = task),
        map(_ => this.service.dialog.show(CaseViewerPopupComponent, {
          key: this.service.serviceKey,
          openedFrom: from,
          model: model,
          loadedModel: model,
          actions
        })),
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
              comInstance.readonly = !model.canStart();
              comInstance.operation = OperationTypes.UPDATE;
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

}
