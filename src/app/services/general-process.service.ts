import { GeneralProcessPopupComponent } from './../administration/popups/general-process-popup/general-process-popup.component';
import { IDialogData } from './../interfaces/i-dialog-data';
import { OperationTypes } from './../enums/operation-types.enum';
import { DialogRef } from './../shared/models/dialog-ref';
import { map, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { CommonStatusEnum } from './../enums/common-status.enum';
import { GeneralProcessComponent } from './../administration/pages/general-process/general-process.component';
import { ComponentType } from '@angular/cdk/overlay';
import { FactoryService } from './factory.service';
import { DialogService } from './dialog.service';
import { UrlService } from './url.service';
import { HttpClient } from '@angular/common/http';
import { GeneralProcess } from '@app/models/genral-process';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { Injectable } from '@angular/core';

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
    return GeneralProcessComponent;
  }


  _getServiceURL(): string {
    return this.urlService.URLS.GENERAL_PROCESS;
  }

  updateStatus(generalProcessId: number, newStatus: CommonStatusEnum) {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activate(generalProcessId) : this._deactivate(generalProcessId);
  }

  updateStatusBulk(recordIds: number[], newStatus: CommonStatusEnum): Observable<any> {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activateBulk(recordIds) : this._deactivateBulk(recordIds);
  }

  private _activate(generalProcessId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + generalProcessId + '/activate', {});
  }

  private _deactivate(generalProcessId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + generalProcessId + '/de-activate', {});
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


  openViewDialog(modelId: number): Observable<DialogRef> {
    return this.getByIdComposite(modelId).pipe(
      switchMap((generalProcess: GeneralProcess) => {
        return of(this.dialog.show<IDialogData<GeneralProcess>>(GeneralProcessPopupComponent, {
          model: generalProcess,
          operation: OperationTypes.VIEW
        }));
      })
    );
  }
}
