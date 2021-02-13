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
import {interceptSendAidLookup, interceptReceiveAidLookup} from '../model-interceptors/aid-lookup-interceptor';
import {Generator} from '../decorators/generator';
import {IAidLookupCriteria} from '../interfaces/i-aid-lookup-criteria';
import {AidTypes} from '../enums/aid-types.enum';

@Injectable({
  providedIn: 'root'
})
export class AidLookupService extends BackendGenericService<AidLookup> {
  list!: AidLookup[];

  constructor(public http: HttpClient, private urlService: UrlService, private dialogService: DialogService) {
    super();
    FactoryService.registerService('AidLookupService', this);
  }

  @Generator(AidLookup, true)
  load(prepare?: boolean): Observable<AidLookup[]> {
    return super.load(prepare);
  }

  @Generator(AidLookup, true)
  loadByCriteria(criteria: IAidLookupCriteria): Observable<AidLookup[]> {
    const queryParams = this.buildCriteriaQueryParams(criteria);

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

  _getModel(): any {
    return AidLookup;
  }

  _getSendInterceptor(): any {
    return interceptSendAidLookup;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.AID_LOOKUPS;
  }

  private buildCriteriaQueryParams(criteria: IAidLookupCriteria): HttpParams {
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
    return interceptReceiveAidLookup;
  }
}
