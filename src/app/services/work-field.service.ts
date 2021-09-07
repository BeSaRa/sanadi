import { Injectable } from '@angular/core';
import {BackendWithDialogOperationsGenericService} from '@app/generics/backend-with-dialog-operations-generic-service';
import {WorkField} from '@app/models/work-field';
import {ComponentType} from '@angular/cdk/portal';
import {WorkFieldPopupComponent} from '@app/administration/popups/work-field-popup/work-field-popup.component';
import {FactoryService} from '@app/services/factory.service';
import {WorkFieldInterceptor} from '@app/model-interceptors/work-field-interceptor';
import {HttpClient} from '@angular/common/http';
import {UrlService} from '@app/services/url.service';
import {DialogService} from '@app/services/dialog.service';
import {Observable, of} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {Generator} from '@app/decorators/generator';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {SubWorkFieldPopupComponent} from '@app/administration/popups/sub-work-field-popup/sub-work-field-popup.component';

@Injectable({
  providedIn: 'root'
})
export class WorkFieldService extends BackendWithDialogOperationsGenericService<WorkField>{
  list: WorkField[] = [];
  interceptor: WorkFieldInterceptor = new WorkFieldInterceptor();
  constructor(public http: HttpClient,
              private urlService: UrlService,
              public dialog: DialogService) {
    super();
    FactoryService.registerService('WorkFieldService', this);
  }

  _getDialogComponent(): ComponentType<any> {
    return WorkFieldPopupComponent;
  }

  _getModel(): any {
    return WorkField;
  }

  _getReceiveInterceptor(): any {
    return this.interceptor.receive;
  }

  _getSendInterceptor(): any {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.WORK_FIELD;
  }

  @Generator(undefined, true, {property: 'rs'})
  private _loadSubWorkFields(workFieldId: number): Observable<WorkField[]> {
    return this.http.get<WorkField[]>(this._getServiceURL() + '/sub/' + workFieldId);
  }

  loadSubWorkFields(workFieldId: number): Observable<WorkField[]> {
    return this._loadSubWorkFields(workFieldId)
      .pipe(
        tap(result => this.list = result),
        tap(result => this._loadDone$.next(result))
      );
  }

  openCreateWorkFieldDialog(workFieldTypeId: number): DialogRef {
    return this.dialog.show<IDialogData<WorkField>>(WorkFieldPopupComponent, {
      model: new WorkField(),
      operation: OperationTypes.CREATE,
      workFieldTypeId: workFieldTypeId
    });
  }

  openUpdateWorkFieldDialog(modelId: number, workFieldTypeId: number): Observable<DialogRef> {
    return this.getById(modelId).pipe(
      switchMap((workField: WorkField) => {
        return of(this.dialog.show<IDialogData<WorkField>>(WorkFieldPopupComponent, {
          model: workField,
          operation: OperationTypes.UPDATE,
          workFieldTypeId: workFieldTypeId
        }));
      })
    );
  }

  openCreateSubWorkFieldDialog(parentId: number, workFieldTypeId: number): DialogRef {
    return this.dialog.show<IDialogData<WorkField>>(SubWorkFieldPopupComponent, {
      model: new WorkField(),
      operation: OperationTypes.CREATE,
      parentId: parentId,
      workFieldTypeId: workFieldTypeId
    });
  }

  openUpdateSubWorkFieldDialog(modelId: number, workFieldTypeId: number, parentId?: number): Observable<DialogRef> {
    return this.getById(modelId).pipe(
      switchMap((workField: WorkField) => {
        return of(this.dialog.show<IDialogData<WorkField>>(SubWorkFieldPopupComponent, {
          model: workField,
          operation: OperationTypes.UPDATE,
          parentId: parentId,
          workFieldTypeId: workFieldTypeId
        }));
      })
    );
  }
}
