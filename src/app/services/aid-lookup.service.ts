import { Injectable } from '@angular/core';
import { AidLookup } from '@models/aid-lookup';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UrlService } from './url.service';
import { FactoryService } from './factory.service';
import { Observable, of } from 'rxjs';
import { DialogRef } from '../shared/models/dialog-ref';
import { switchMap } from 'rxjs/operators';
import { IDialogData } from '@contracts/i-dialog-data';
import { OperationTypes } from '@enums/operation-types.enum';
import { DialogService } from './dialog.service';
import { AidLookupPopupComponent } from '../administration/popups/aid-lookup-popup/aid-lookup-popup.component';
import { IAidLookupCriteria } from '@contracts/i-aid-lookup-criteria';
import { ComponentType } from '@angular/cdk/portal';
import { AidLookupStatusEnum } from '@app/enums/status.enum';
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";
import { Pagination } from "@app/models/pagination";
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";

@CastResponseContainer({
  $default: {
    model: () => AidLookup
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => AidLookup }
  }
})
@Injectable({
  providedIn: 'root'
})
export class AidLookupService extends CrudWithDialogGenericService<AidLookup> {
  list!: AidLookup[];

  constructor(public http: HttpClient,
              private urlService: UrlService,
              public dialog: DialogService) {
    super();
    FactoryService.registerService('AidLookupService', this);
  }

  _getDialogComponent(): ComponentType<any> {
    return AidLookupPopupComponent;
  }

  _getModel(): any {
    return AidLookup;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.AID_LOOKUPS;
  }

  @CastResponse(undefined)
  loadByCriteria(criteria: IAidLookupCriteria): Observable<AidLookup[]> {
    const queryParams = AidLookupService.buildCriteriaQueryParams(criteria);

    return this.http.get<AidLookup[]>(this.urlService.URLS.AID_LOOKUPS_CRITERIA, {
      params: queryParams
    });
  }

  openUpdateDialog(modelId: number, aidType: number): Observable<DialogRef> {
    return this.getById(modelId).pipe(
      switchMap((aidLookup: AidLookup) => {
        return of(this.dialog.show<IDialogData<AidLookup>>(AidLookupPopupComponent, {
          model: aidLookup,
          parentId: aidLookup.id,
          operation: OperationTypes.UPDATE,
          aidType
        }));
      })
    );
  }
  openViewDialog(modelId: number, aidType: number): Observable<DialogRef> {
    return this.getById(modelId).pipe(
      switchMap((aidLookup: AidLookup) => {
        return of(this.dialog.show<IDialogData<AidLookup>>(AidLookupPopupComponent, {
          model: aidLookup,
          parentId: aidLookup.id,
          operation: OperationTypes.VIEW,
          aidType
        }));
      })
    );
  }
  openCreateDialog(aidType: number, parentId: number): DialogRef {
    return this.dialog.show<IDialogData<AidLookup>>(AidLookupPopupComponent, {
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

  updateStatus(id: number, currentStatus: AidLookupStatusEnum) {
    return currentStatus === AidLookupStatusEnum.ACTIVE ? this.deactivate(id) : this.activate(id);
  }

  private activate(id: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + id + '/activate', {});
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
}
