import { Injectable } from '@angular/core';
import { AdminLookup } from '@app/models/admin-lookup';
import { HttpClient } from '@angular/common/http';
import { UrlService } from '@services/url.service';
import { DialogService } from '@services/dialog.service';
import { FactoryService } from '@services/factory.service';
import { ComponentType } from '@angular/cdk/portal';
import { AdminLookupInterceptor } from '@app/model-interceptors/admin-lookup-interceptor';
import { AdminLookupPopupComponent } from '@app/administration/popups/admin-lookup-popup/admin-lookup-popup.component';
import { AdminLookupTypeEnum } from '@app/enums/admin-lookup-type-enum';
import { catchError, map } from 'rxjs/operators';
import { Observable, of, Subject } from 'rxjs';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { IDefaultResponse } from '@contracts/idefault-response';
import { CrudServiceAdminLookupContract } from '@contracts/crud-service-admin-lookup-contract';
import { CastResponse, CastResponseContainer } from '@decorators/cast-response';
import { HasInterception, InterceptParam } from '@decorators/intercept-model';
import { Pagination } from '@app/models/pagination';
import { PaginationContract } from '@contracts/pagination-contract';

@CastResponseContainer({
  $default: {
    model: () => AdminLookup
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => AdminLookup }
  }
})
@Injectable({
  providedIn: 'root'
})
export class AdminLookupService implements CrudServiceAdminLookupContract<AdminLookup> {
  list: AdminLookup[] = [];
  _loadDone$: Subject<AdminLookup[]> = new Subject<AdminLookup[]>();
  interceptor: AdminLookupInterceptor = new AdminLookupInterceptor();

  constructor(public http: HttpClient,
    private urlService: UrlService,
    public dialog: DialogService) {
    FactoryService.registerService('AdminLookupService', this);
  }

  _getDialogComponent(): ComponentType<any> {
    return AdminLookupPopupComponent;
  }

  _getModel(): any {
    return AdminLookup;
  }

  _getReceiveInterceptor(): any {
    return this.interceptor.receive;
  }

  _getSendInterceptor(): any {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.ADMIN_LOOKUP;
  }

  private _getServiceURLByType(typeId: AdminLookupTypeEnum) {
    let url: string = this._getServiceURL();
    switch (typeId) {
      case AdminLookupTypeEnum.DAC_OCHA:
      case AdminLookupTypeEnum.DAC:
      case AdminLookupTypeEnum.OCHA:
        url += '/work-field';
        break;
      case AdminLookupTypeEnum.ACTIVITY_TYPE:
        url += '/activity-type';
        break;
      case AdminLookupTypeEnum.BYLAWS_CLASSIFICATION:
        url += '/bylaws-classification';
        break;
      case AdminLookupTypeEnum.COORDINATION_SUPPORT_CLASSIFICATION:
        url += '/coordination-support';
        break;
      case AdminLookupTypeEnum.INTERNAL_AID_CLASSIFICATION:
        url += '/internal-aid';
        break;
      case AdminLookupTypeEnum.PENALTIES_DECISION:
        url += '/penalties-decision';
        break;
      case AdminLookupTypeEnum.REGISTRATION_ENTITY:
        url += '/registration-entity';
        break;
      case AdminLookupTypeEnum.RESOLUTIONS_ISSUED:
        url += '/resolutions-issued';
        break;
      case AdminLookupTypeEnum.RISK_CLASSIFICATION:
        url += '/risk-classification';
        break;
      case AdminLookupTypeEnum.RISK_TYPE:
        url += '/risk-type';
        break;
    }
    return url;
  }

  @CastResponse(() => AdminLookup, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _loadAdminLookupData(typeId: AdminLookupTypeEnum) {
    if (!typeId) {
      return of([]);
    }
    return this.http.get<AdminLookup[]>(this._getServiceURLByType(typeId) + '/composite')
      .pipe((catchError((_) => of([]))));
  }

  load(typeId: AdminLookupTypeEnum) {
    return this._loadAdminLookupData(typeId);
  }

  @CastResponse(() => AdminLookup, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _loadAdminLookupDataComposite(typeId: AdminLookupTypeEnum) {
    if (!typeId) {
      return of([]);
    }
    return this.http.get<AdminLookup[]>(this._getServiceURLByType(typeId) + '/composite')
      .pipe((catchError((_) => of([]))));
  }

  loadComposite(typeId: AdminLookupTypeEnum) {
    return this._loadAdminLookupDataComposite(typeId);
  }

  @CastResponse(() => AdminLookup, {
    unwrap: 'rs',
    fallback: '$default'
  })
  loadAsLookups(typeId: AdminLookupTypeEnum) {
    if (!typeId) {
      return of([]);
    }
    return this.http.get<AdminLookup[]>(this._getServiceURLByType(typeId) + '/lookup')
      .pipe((catchError((_) => of([]))));
  }

  @CastResponse(undefined, {
    fallback: '$pagination'
  })
  private _paginate(options: Partial<PaginationContract>, typeId: AdminLookupTypeEnum): Observable<Pagination<AdminLookup[]>> {
    return this.http.get<Pagination<AdminLookup[]>>(this._getServiceURLByType(typeId) + '/composite/pg', {
      params: { ...options }
    });
  }

  paginate(options: Partial<PaginationContract>, typeId: AdminLookupTypeEnum): Observable<Pagination<AdminLookup[]>> {
    return this._paginate(options, typeId);
  }

  @CastResponse(undefined, {
    fallback: '$pagination'
  })
  private _paginateComposite(options: Partial<PaginationContract>, typeId: AdminLookupTypeEnum): Observable<Pagination<AdminLookup[]>> {
    return this.http.get<Pagination<AdminLookup[]>>(this._getServiceURLByType(typeId) + '/composite/pg', {
      params: { ...options }
    });
  }

  paginateComposite(options: Partial<PaginationContract>, typeId: AdminLookupTypeEnum): Observable<Pagination<AdminLookup[]>> {
    return this._paginateComposite(options, typeId);
  }

  @CastResponse(() => AdminLookup, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _loadWorkFieldsByType(typeId: AdminLookupTypeEnum) {
    if (!typeId) {
      return of([]);
    }
    return this.http.get<AdminLookup[]>(this._getServiceURLByType(typeId) + '/type/' + typeId)
      .pipe((catchError((_) => of([]))));
  }

  loadWorkFieldsByType(typeId: AdminLookupTypeEnum) {
    return this._loadWorkFieldsByType(typeId);
  }

  @CastResponse(undefined, {
    fallback: '$pagination'
  })
  private _loadWorkFieldsByTypePaging(options: Partial<PaginationContract>, typeId: AdminLookupTypeEnum): Observable<Pagination<AdminLookup[]>> {
    return this.http.get<Pagination<AdminLookup[]>>(this._getServiceURLByType(typeId) + '/type/' + typeId, {
      params: options
    }).pipe((catchError((_) => {
      return of({
        rs: [],
        count: 0,
        sc: 200
      } as Pagination<AdminLookup[]>);
    })));
  }

  loadWorkFieldsByTypePaging(options: Partial<PaginationContract>, typeId: AdminLookupTypeEnum): Observable<Pagination<AdminLookup[]>> {
    if (!typeId) {
      return of({
        rs: [],
        count: 0,
        sc: 200
      } as Pagination<AdminLookup[]>);
    }
    return this._loadWorkFieldsByTypePaging(options, typeId);
  }

  @CastResponse(() => AdminLookup, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _loadWorkFieldsByParent(parentId: number) {
    if (!parentId) {
      return of([]);
    }
    return this.http.get<AdminLookup[]>(this._getServiceURLByType(AdminLookupTypeEnum.DAC_OCHA) + '/sub/' + parentId)
      .pipe((catchError((_) => of([]))));
  }

  loadWorkFieldsByParent(parentId: number) {
    return this._loadWorkFieldsByParent(parentId);
  }

  @CastResponse(undefined, {
    fallback: '$pagination'
  })
  private _loadWorkFieldsByParentPaging(options: Partial<PaginationContract>, parentId: number): Observable<Pagination<AdminLookup[]>> {
    return this.http.get<Pagination<AdminLookup[]>>(this._getServiceURLByType(AdminLookupTypeEnum.DAC_OCHA) + '/sub/' + parentId, {
      params: options
    }).pipe((catchError((_) => {
      return of({
        rs: [],
        count: 0,
        sc: 200
      } as Pagination<AdminLookup[]>);
    })));
  }

  loadWorkFieldsByParentPaging(options: Partial<PaginationContract>, parentId: number): Observable<Pagination<AdminLookup[]>> {
    if (!parentId) {
      return of({
        rs: [],
        count: 0,
        sc: 200
      } as Pagination<AdminLookup[]>);
    }
    return this._loadWorkFieldsByParentPaging(options, parentId);
  }

  @CastResponse(() => AdminLookup, {
    fallback: '$default',
    unwrap: 'rs'
  })
  getById(modelId: number): Observable<AdminLookup> {
    return this.http.get<AdminLookup>(this._getServiceURL() + '/' + modelId);
  }

  @CastResponse(() => AdminLookup, {
    fallback: '$default',
    unwrap: 'rs'
  })
  getByIdComposite(modelId: number): Observable<AdminLookup> {
    return this.http.get<AdminLookup>(this._getServiceURL() + '/' + modelId + '/composite');
  }

  @HasInterception
  @CastResponse(() => AdminLookup, {
    fallback: '$default',
    unwrap: 'rs'
  })
  create(@InterceptParam() model: AdminLookup, typeId: AdminLookupTypeEnum): Observable<AdminLookup> {
    return this.http.post<AdminLookup>(this._getServiceURLByType(model.type) + '/full', model);
  }

  @CastResponse(() => AdminLookup, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _update(model: AdminLookup): Observable<AdminLookup> {
    return this.http.put<AdminLookup>(this._getServiceURL() + '/full', model);
  }

  @HasInterception
  update(@InterceptParam() model: AdminLookup, typeId: AdminLookupTypeEnum): Observable<AdminLookup> {
    return this._update(model);
  }

  delete(modelId: number, typeId: AdminLookupTypeEnum): Observable<boolean> {
    return this.http.delete<boolean>(this._getServiceURLByType(typeId) + '/' + modelId);
  }

  deleteBulk(modelIds: any[], typeId: AdminLookupTypeEnum): Observable<Record<number, boolean>> {
    return this.http.request<IDefaultResponse<Record<number, boolean>>>('delete', this._getServiceURLByType(typeId) + '/bulk', { body: modelIds })
      .pipe(
        map((response: any) => {
          return response.rs;
        })
      );
  }

  updateStatus(id: number, typeId: AdminLookupTypeEnum, newStatus: CommonStatusEnum) {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activate(id, typeId) : this._deactivate(id, typeId);
  }

  updateStatusBulk(recordIds: number[], typeId: AdminLookupTypeEnum, newStatus: CommonStatusEnum): Observable<any> {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activateBulk(recordIds, typeId) : this._deactivateBulk(recordIds, typeId);
  }

  private _activate(id: number, typeId: AdminLookupTypeEnum): Observable<any> {
    return this.http.put<any>(this._getServiceURLByType(typeId) + '/' + id + '/activate', {});
  }

  private _deactivate(id: number, typeId: AdminLookupTypeEnum): Observable<any> {
    return this.http.put<any>(this._getServiceURLByType(typeId) + '/' + id + '/de-activate', {});
  }

  private _activateBulk(recordIds: number[], typeId: AdminLookupTypeEnum) {
    return this.http.put(this._getServiceURLByType(typeId) + '/bulk/activate', recordIds)
      .pipe(
        map((response: any) => {
          return response.rs;
        })
      );
  }

  private _deactivateBulk(recordIds: number[], typeId: AdminLookupTypeEnum) {
    return this.http.put(this._getServiceURLByType(typeId) + '/bulk/de-activate', recordIds)
      .pipe(
        map((response: any) => {
          return response.rs;
        })
      );
  }
}
