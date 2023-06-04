import { CommonStatusEnum } from './../enums/common-status.enum';
import { Pagination } from './../models/pagination';
import { GeneralProcessPopupComponent } from './../administration/popups/general-process-popup/general-process-popup.component';
import { IDialogData } from './../interfaces/i-dialog-data';
import { OperationTypes } from './../enums/operation-types.enum';
import { DialogRef } from './../shared/models/dialog-ref';
import { switchMap, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { ComponentType } from '@angular/cdk/overlay';
import { FactoryService } from './factory.service';
import { DialogService } from './dialog.service';
import { UrlService } from './url.service';
import { HttpClient } from '@angular/common/http';
import { GeneralProcess } from '@app/models/genral-process';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { Injectable } from '@angular/core';
import { CastResponseContainer } from '@app/decorators/decorators/cast-response';


@CastResponseContainer({
  $default: {
    model: () => GeneralProcess
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => GeneralProcess }
  }
})
@Injectable({
  providedIn: 'root'
})
export class GeneralProcessService extends CrudWithDialogGenericService<GeneralProcess> {
  _getModel(): new () => GeneralProcess {
    return GeneralProcess
  }

  list: GeneralProcess[] = [];
  constructor(public http: HttpClient,
    private urlService: UrlService,
    public dialog: DialogService) {
    super();
    FactoryService.registerService('GeneralProcessService', this);
  }

  _getDialogComponent(): ComponentType<any> {
    return GeneralProcessPopupComponent;
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
    return this.urlService.URLS.GENERAL_PROCESS;
  }
  openViewDialog(modelId: number): Observable<DialogRef> {
    return this.getByIdComposite(modelId).pipe(
      switchMap((generalProcess: GeneralProcess) => {
        return of(this.dialog.show<IDialogData<GeneralProcess>>(
          this._getDialogComponent(),
          {
            model: generalProcess,
            operation: OperationTypes.VIEW
          },
          { fullscreen: true }
        ));
      })
    );
  }
}
