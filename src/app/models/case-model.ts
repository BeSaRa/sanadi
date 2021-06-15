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
import {ISearchFields} from '../interfaces/i-search-fields';
import {searchFunctionType} from '../types/types';

export abstract class CaseModel<S extends EServiceGenericService<T>, T extends FileNetModel<T>> extends FileNetModel<T> implements ISearchFields {
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

  searchFields: { [key: string]: string | searchFunctionType } = {};

  search(searchText: string): boolean {
    const self = this as unknown as ISearchFields;
    const fields = (this as unknown as ISearchFields).searchFields;
    const keys = Object.keys(fields);
    if (!searchText) {
      return true;
    }
    return keys.some((key) => {
      if (typeof self.searchFields[key] === 'function') {
        const func = self.searchFields[key] as searchFunctionType;
        return func(searchText.trim().toLowerCase());
      } else {
        const field = self.searchFields[key] as string;
        const value = (this as unknown as any)[field] ? ((this as unknown as any)[field] as string) + '' : '';
        return value.toLowerCase().indexOf(searchText.trim().toLowerCase()) !== -1;
      }
    });
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
    return Object.keys(this).filter((key) => !!self[key]).reduce((acc, current) => {
      return (current === 'service' || current === 'caseType') ? acc : {...acc, [current]: self[current]};
    }, {});
  }

  viewLogs(): DialogRef {
    return this.service.openActionLogs(this.id);
  }

  manageAttachments(): DialogRef {
    return this.service.openDocumentDialog(this.id);
  }

  manageRecommendations(): DialogRef {
    return this.service.openRecommendationDialog(this.id);
  }

  manageComments(): DialogRef {
    return this.service.openCommentsDialog(this.id);
  }

  open(actions?: IMenuItem[]): Observable<DialogRef> {
    const componentName = this.service.getCaseComponentName();
    const component: ComponentType<any> = DynamicComponentService.getComponent(componentName);
    const cfr = this.service.getCFR();
    const factory = cfr.resolveComponentFactory(component);
    let model: any;
    return this.service.getById(this.id)
      .pipe(
        tap(task => model = task),
        map(_ => this.service.dialog.show(CaseViewerPopupComponent, {key: this.service.serviceKey, model: model, actions})),
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
              instance.component = comInstance;
            });
        })
      );
  }

  getStatusIcon(): string {
    return this.service.getStatusIcon(this.caseStatus);
  }


}
