import { Injectable } from '@angular/core';
import { DacOcha } from '@app/models/dac-ocha';
import { ComponentType } from '@angular/cdk/portal';
import { DacOchaPopupComponent } from '@app/administration/popups/dac-ocha-popup/dac-ocha-popup.component';
import { FactoryService } from '@app/services/factory.service';
import { DacOchaInterceptor } from '@app/model-interceptors/dac-ocha-interceptor';
import { HttpClient } from '@angular/common/http';
import { UrlService } from '@app/services/url.service';
import { DialogService } from '@app/services/dialog.service';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { SubDacOchaPopupComponent } from '@app/administration/popups/sub-dac-ocha-popup/sub-dac-ocha-popup.component';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { CommonUtils } from '@app/helpers/common-utils';
import { AdminLookupTypeEnum } from '@app/enums/admin-lookup-type-enum';
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";
import { Pagination } from '@app/models/pagination';

@CastResponseContainer({
  $default: {
    model: () => DacOcha
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => DacOcha }
  }
})
@Injectable({
  providedIn: 'root'
})
export class DacOchaService extends CrudWithDialogGenericService<DacOcha> {
  list: DacOcha[] = [];
  interceptor: DacOchaInterceptor = new DacOchaInterceptor();

  constructor(public http: HttpClient,
              private urlService: UrlService,
              public dialog: DialogService) {
    super();
    FactoryService.registerService('DacOchaService', this);
  }

  _getDialogComponent(): ComponentType<any> {
    return DacOchaPopupComponent;
  }

  _getModel(): any {
    return DacOcha;
  }

  _getReceiveInterceptor(): any {
    return this.interceptor.receive;
  }

  _getSendInterceptor(): any {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.DAC_OCHA;
  }

  @CastResponse(undefined)
  private _loadSubDacOchas(dacOchaId: number): Observable<DacOcha[]> {
    return this.http.get<DacOcha[]>(this._getServiceURL() + '/sub/' + dacOchaId);
  }

  loadSubDacOchas(dacOchaId: number): Observable<DacOcha[]> {
    return this._loadSubDacOchas(dacOchaId)
      .pipe(
        tap(result => this.list = result),
        tap(result => this._loadDone$.next(result))
      );
  }

  @CastResponse(undefined)
  private _loadByType(typeId: number): Observable<DacOcha[]> {
    return this.http.get<DacOcha[]>(this._getServiceURL() + '/type/' + typeId);
  }

  loadOCHAs(): Observable<DacOcha[]> {
    return this._loadByType(AdminLookupTypeEnum.OCHA);
  }

  loadDACs(): Observable<DacOcha[]> {
    return this._loadByType(AdminLookupTypeEnum.DAC);
  }

  openCreateDacOchaDialog(dacOchaTypeId: number): DialogRef {
    return this.dialog.show<IDialogData<DacOcha>>(DacOchaPopupComponent, {
      model: new DacOcha(),
      operation: OperationTypes.CREATE,
      dacOchaTypeId: dacOchaTypeId,
      selectedTab: 'basic'
    });
  }

  openUpdateDacOchaDialog(modelId: number, dacOchaTypeId: number, selectedTab: string = 'basic'): Observable<DialogRef> {
    return this.getById(modelId).pipe(
      switchMap((dacOcha: DacOcha) => {
        return of(this.dialog.show<IDialogData<DacOcha>>(DacOchaPopupComponent, {
          model: dacOcha,
          operation: OperationTypes.UPDATE,
          dacOchaTypeId: dacOchaTypeId,
          selectedTab: (CommonUtils.isValidValue(selectedTab) ? selectedTab : 'basic')
        }));
      })
    );
  }

  openCreateSubDacOchaDialog(parentId: number, dacOchaTypeId: number): DialogRef {
    return this.dialog.show<IDialogData<DacOcha>>(SubDacOchaPopupComponent, {
      model: new DacOcha(),
      operation: OperationTypes.CREATE,
      parentId: parentId,
      dacOchaTypeId: dacOchaTypeId
    });
  }

  openUpdateSubDacOchaDialog(modelId: number, dacOchaTypeId: number, parentId?: number): Observable<DialogRef> {
    return this.getById(modelId).pipe(
      switchMap((dacOcha: DacOcha) => {
        return of(this.dialog.show<IDialogData<DacOcha>>(SubDacOchaPopupComponent, {
          model: dacOcha,
          operation: OperationTypes.UPDATE,
          parentId: parentId,
          dacOchaTypeId: dacOchaTypeId
        }));
      })
    );
  }

  updateStatus(dacOchaId: number, newStatus: CommonStatusEnum) {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activate(dacOchaId) : this._deactivate(dacOchaId);
  }

  updateStatusBulk(recordIds: number[], newStatus: CommonStatusEnum): Observable<any> {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activateBulk(recordIds) : this._deactivateBulk(recordIds);
  }

  private _activate(dacOchaId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + dacOchaId + '/activate', {});
  }

  private _deactivate(dacOchaId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + dacOchaId + '/de-activate', {});
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
}
