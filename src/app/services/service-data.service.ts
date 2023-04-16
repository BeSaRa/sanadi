import { Injectable } from '@angular/core';
import { ServiceData } from '../models/service-data';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FactoryService } from './factory.service';
import { UrlService } from './url.service';
import { DialogRef } from '../shared/models/dialog-ref';
import { IDialogData } from '@contracts/i-dialog-data';
import { OperationTypes } from '../enums/operation-types.enum';
import { Observable, of } from 'rxjs';
import { DialogService } from './dialog.service';
import { ServiceDataPopupComponent } from '../administration/popups/service-data-popup/service-data-popup.component';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";
import { ComponentType } from '@angular/cdk/portal';
import { CastResponse, CastResponseContainer } from '@decorators/cast-response';
import { Pagination } from "@app/models/pagination";
import { CaseTypes } from '@app/enums/case-types.enum';
import { BlobModel } from '@app/models/blob-model';
import { DomSanitizer } from '@angular/platform-browser';
import { CustomServiceTemplate } from '@app/models/custom-service-template';
import { InterceptParam } from '@app/decorators/decorators/intercept-model';

@CastResponseContainer({
  $default: {
    model: () => ServiceData
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => ServiceData }
  },
  $CustomServiceTemplate: {
    model: () => CustomServiceTemplate
  }
})
@Injectable({
  providedIn: 'root'
})
export class ServiceDataService extends CrudWithDialogGenericService<ServiceData> {
  list: ServiceData[] = [];

  constructor(public http: HttpClient,
    private domSanitizer: DomSanitizer,
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
  _getServiceURLByCaseType(caseType: number) {
    if (caseType == CaseTypes.AWARENESS_ACTIVITY_SUGGESTION) {
      return this.urlService.URLS.AWARENESS_ACTIVITY_SUGGESTION;
    } else if (caseType == CaseTypes.ORGANIZATION_ENTITIES_SUPPORT) {
      return this.urlService.URLS.ORGANIZATION_ENTITIES_SUPPORT;
    }
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
  loadTemplateDocId(caseType: number = 0, docId: string) {
    return this.http.get(this._getServiceURLByCaseType(caseType) + '/template/' + docId + '/download', {
      responseType: 'blob',
      observe: 'body'
    }).pipe(
      map(blob => new BlobModel(blob, this.domSanitizer),
        catchError(_ => {
          return of(new BlobModel(new Blob([], { type: 'error' }), this.domSanitizer));
        })));
  }

  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$CustomServiceTemplate'
  })
  loadTemplatesbyCaseType(caseType: number) {
    return this.http.get<CustomServiceTemplate[]>(this._getServiceURLByCaseType(caseType) + '/templates?isActive=true')
  }
  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$CustomServiceTemplate'
  })
  addTemplate(caseType: number = 0, @InterceptParam() model: CustomServiceTemplate, file: File) {
    const formData = new FormData();
    file ? formData.append('content', file) : null;
    return this.http.post<any>(this._getServiceURLByCaseType(caseType) + '/template/service', formData, {
      params: new HttpParams({ fromObject: model as any })
    }).pipe(catchError(() => of(null)));
  }

  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$CustomServiceTemplate'
  })
  updateProps(caseType: number = 0, model: CustomServiceTemplate) {
    return this.http.post<any>(this._getServiceURLByCaseType(caseType) + '/template/update-prop', model)
    .pipe(catchError(() => of(null)));
  }

  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$CustomServiceTemplate'
  })
  updateContent(caseType: number = 0, @InterceptParam() model: CustomServiceTemplate, file: File) {
    const formData = new FormData();
    file ? formData.append('content', file) : null;
    return this.http.post<any>(this._getServiceURLByCaseType(caseType) + '/template/update-content', formData, {
      params: new HttpParams({ fromObject: model as any })
    }).pipe(catchError(() => of(null)));
  }
  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$CustomServiceTemplate'
  })
  updateProp(caseType: number = 0, model: CustomServiceTemplate) {
    console.log(model)
    return this.http.post<any>(this._getServiceURLByCaseType(caseType) + '/template/update-prop', model)
      .pipe(catchError(() => of(null)));
  }
}
