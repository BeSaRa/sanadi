import { CommonStatusEnum } from './../enums/common-status.enum';
import { Pagination } from './../models/pagination';
import { DynamicModelPopupComponent } from './../administration/popups/dynamic-model-popup/dynamic-model-popup.component';
import { DynamicModel } from './../models/dynamic-model';
import { CastResponseContainer } from "@app/decorators/decorators/cast-response";
import { Injectable } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { Subject, Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { DialogService } from './dialog.service';
import { FactoryService } from './factory.service';
import { UrlService } from './url.service';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';

@CastResponseContainer({
  $default: {
    model: () => DynamicModel
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => DynamicModel }
  }
})
@Injectable({
  providedIn: 'root'
})
export class DynamicModelService extends CrudWithDialogGenericService<DynamicModel>{
  _getModel(): new () => DynamicModel {
    return DynamicModel
  }

  list: DynamicModel[] = [];
  private _selectField: Subject<string> = new Subject<string>();
  constructor(public http: HttpClient,
    private urlService: UrlService,
    public dialog: DialogService) {
    super();
    FactoryService.registerService('DynamicModelService', this);
  }

  _getDialogComponent(): ComponentType<any> {
    return DynamicModelPopupComponent;
  }


  updateStatus(recordId: number, newStatus: CommonStatusEnum) {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activate(recordId) : this._deactivate(recordId);
  }

  updateStatusBulk(recordIds: number[], newStatus: CommonStatusEnum): Observable<any> {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activateBulk(recordIds) : this._deactivateBulk(recordIds);
  }

  private _activate(recordId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + recordId + '/activate', {});
  }

  private _deactivate(recordId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + recordId + '/de-activate', {});
  }

  private _activateBulk(recordIds: number[]) {
    return this.http.put(this._getServiceURL() + '/bulk/activate', recordIds)
      .pipe(
        map((response: any) => {
          return response.rs;
        })
      );
  }
  private _deactivateBulk(recordIds: number[]) {
    return this.http.put(this._getServiceURL() + '/bulk/de-activate', recordIds)
      .pipe(
        map((response: any) => {
          return response.rs;
        })
      );
  }
  _getServiceURL(): string {
    return this.urlService.URLS.DYNAMIC_MODEL;
  }
  listenToSelectField() {
    return this._selectField
  }
  setlectField(fieldId: string) {
    this._selectField.next(fieldId);
  }
  openViewDialog(modelId: number): Observable<DialogRef> {
    return this.getByIdComposite(modelId).pipe(
      switchMap((DynamicModel: DynamicModel) => {
        return of(this.dialog.show<IDialogData<DynamicModel>>(
          this._getDialogComponent(),
          {
            model: DynamicModel,
            operation: OperationTypes.VIEW
          },
          { fullscreen: true }
        ));
      })
    );
  }

}
