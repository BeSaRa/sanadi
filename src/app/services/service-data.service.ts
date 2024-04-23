import { Injectable } from '@angular/core';
import { ServiceData } from '../models/service-data';
import { HttpClient } from '@angular/common/http';
import { FactoryService } from './factory.service';
import { UrlService } from './url.service';
import { DialogRef } from '../shared/models/dialog-ref';
import { IDialogData } from '@contracts/i-dialog-data';
import { OperationTypes } from '../enums/operation-types.enum';
import { Observable, of } from 'rxjs';
import { DialogService } from './dialog.service';
import { ServiceDataPopupComponent } from '../administration/popups/service-data-popup/service-data-popup.component';
import { switchMap } from 'rxjs/operators';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";
import { ComponentType } from '@angular/cdk/portal';
import { CastResponse, CastResponseContainer } from '@decorators/cast-response';
import { Pagination } from "@app/models/pagination";
@CastResponseContainer({
  $default: {
    model: () => ServiceData
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => ServiceData }
  },
})
@Injectable({
  providedIn: 'root'
})
export class ServiceDataService extends CrudWithDialogGenericService<ServiceData> {
  list: ServiceData[] = [];

  constructor(public http: HttpClient,
    public dialog: DialogService,
    private urlService: UrlService) {
    super();
    FactoryService.registerService('ServiceDataService', this);
  }

  _getModel(): new () => ServiceData {
    return ServiceData;
  }

  _getDialogComponent(): ComponentType<any> {
    return ServiceDataPopupComponent;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.SERVICE_DATA;
  }
  editDialog(model: ServiceData): Observable<DialogRef> {
    return this.getById(model.id).pipe(
      switchMap((serviceData: ServiceData) => {
        return of(this.dialog.show<IDialogData<ServiceData>>(ServiceDataPopupComponent, {
          model: serviceData,
          operation: OperationTypes.UPDATE,
          list: this.list
        }));
      })
    );
  }

  openViewDialog(modelId: number): Observable<DialogRef> {
    return this.getById(modelId).pipe(
      switchMap((serviceData: ServiceData) => {
        return of(this.dialog.show<IDialogData<ServiceData>>(ServiceDataPopupComponent, {
          model: serviceData,
          operation: OperationTypes.VIEW
        }));
      })
    );
  }

  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  private _loadByCaseType(caseType: number): Observable<ServiceData> {
    return this.http.get<ServiceData>(this._getServiceURL() + '/caseType/' + caseType);
  }

  loadByCaseType(caseType: number): Observable<ServiceData> {
    return this._loadByCaseType(caseType);
  }

  updateStatus(serviceId: number, currentStatus: CommonStatusEnum) {
    return currentStatus === CommonStatusEnum.ACTIVATED ? this._deactivate(serviceId) : this._activate(serviceId);
  }

  private _activate(serviceId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + serviceId + '/activate', {});
  }

  private _deactivate(serviceId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + serviceId + '/de-activate', {});
  }

  private _followUpEnable(serviceId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + serviceId + '/follow-up/enable', {});
  }

  private _followUpDisable(serviceId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + serviceId + '/follow-up/disable', {});
  }

  toggleFollowUpStatus(serviceId: number, status: boolean) {
    return status ? this._followUpEnable(serviceId) : this._followUpDisable(serviceId);
  }
  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  loadCustomSettings(caseType: number): Observable<Record<number,number[]>> {
    return this.http.get<Record<number,number[]>>(this._getServiceURL() + `/${caseType}/custom-setting`);
  }

}
