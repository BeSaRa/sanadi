import {Injectable} from '@angular/core';
import {BackendGenericService} from '../generics/backend-generic-service';
import {AidLookup} from '../models/aid-lookup';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UrlService} from './url.service';
import {FactoryService} from './factory.service';
import {Observable, of} from 'rxjs';
import {DialogRef} from '../shared/models/dialog-ref';
import {switchMap} from 'rxjs/operators';
import {IDialogData} from '../interfaces/i-dialog-data';
import {OperationTypes} from '../enums/operation-types.enum';
import {DialogService} from './dialog.service';
import {AidLookupPopupComponent} from '../administration/popups/aid-lookup-popup/aid-lookup-popup.component';
import {AidLookupInterceptor} from '../model-interceptors/aid-lookup-interceptor';
import {Generator} from '../decorators/generator';
import {IAidLookupCriteria} from '../interfaces/i-aid-lookup-criteria';
import {AuditLogService} from './audit-log.service';
import {CommonStatusEnum} from '@app/enums/common-status.enum';

@Injectable({
  providedIn: 'root'
})
export class AidLookupService extends BackendGenericService<AidLookup> {
  list!: AidLookup[];

  constructor(public http: HttpClient,
              private urlService: UrlService,
              private dialogService: DialogService,
              private auditLogService: AuditLogService) {
    super();
    FactoryService.registerService('AidLookupService', this);
  }

  @Generator(AidLookup, true)
  loadByCriteria(criteria: IAidLookupCriteria): Observable<AidLookup[]> {
    const queryParams = AidLookupService.buildCriteriaQueryParams(criteria);

    return this.http.get<AidLookup[]>(this.urlService.URLS.AID_LOOKUPS_CRITERIA, {
      params: queryParams
    });
  }

  openUpdateDialog(modelId: number, aidType: number): Observable<DialogRef> {
    return this.getById(modelId).pipe(
      switchMap((aidLookup: AidLookup) => {
        return of(this.dialogService.show<IDialogData<AidLookup>>(AidLookupPopupComponent, {
          model: aidLookup,
          parentId: aidLookup.id,
          operation: OperationTypes.UPDATE,
          aidType
        }));
      })
    );
  }

  openCreateDialog(aidType: number, parentId: number): DialogRef {
    return this.dialogService.show<IDialogData<AidLookup>>(AidLookupPopupComponent, {
      model: new AidLookup(),
      parentId,
      operation: OperationTypes.CREATE,
      aidType
    });
  }

  deactivate(id: number): Observable<boolean> {
    return this.http.put<boolean>(this._getServiceURL() + '/' + id + '/de-activate', {});
  }

  deactivateBulk(ids: number[]): Observable<{ [key: number]: boolean }> {
    return this.http.put<{ [key: number]: boolean }>(this._getServiceURL() + '/bulk/de-activate', ids);
  }

  updateStatus(id: number, currentStatus: CommonStatusEnum) {
    return currentStatus === CommonStatusEnum.ACTIVATED ? this.deactivate(id) : this.activate(id);
  }

  private activate(id: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + id + '/activate', {});
  }

  _getModel(): any {
    return AidLookup;
  }

  _getSendInterceptor(): any {
    return AidLookupInterceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.AID_LOOKUPS;
  }

  private static buildCriteriaQueryParams(criteria: IAidLookupCriteria): HttpParams {
    let queryParams = new HttpParams();

    if (criteria.aidType) {
      queryParams = queryParams.append('aidType', criteria.aidType.toString());
    }
    if (criteria.parent) {
      queryParams = queryParams.append('parent', criteria.parent);
    }
    if (criteria.aidCode) {
      queryParams = queryParams.append('aidCode', criteria.aidCode);
    }
    if (criteria.status) {
      queryParams = queryParams.append('status', criteria.status);
    }
    return queryParams;
  }

  _getReceiveInterceptor(): any {
    return AidLookupInterceptor.receive;
  }

  openAuditLogsById(id: number): Observable<DialogRef> {
    return this.auditLogService.openAuditLogsDialog(id, this._getServiceURL());
  }
}
