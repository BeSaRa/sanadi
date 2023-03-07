import {Injectable} from '@angular/core';
import {AdminLookup} from '@app/models/admin-lookup';
import {HttpClient} from '@angular/common/http';
import {UrlService} from '@services/url.service';
import {DialogService} from '@services/dialog.service';
import {FactoryService} from '@services/factory.service';
import {ComponentType} from '@angular/cdk/portal';
import {AdminLookupInterceptor} from '@app/model-interceptors/admin-lookup-interceptor';
import {AdminLookupPopupComponent} from '@app/administration/popups/admin-lookup-popup/admin-lookup-popup.component';
import {AdminLookupTypeEnum} from '@app/enums/admin-lookup-type-enum';
import {catchError, map, switchMap} from 'rxjs/operators';
import {Observable, of, Subject} from 'rxjs';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {IDefaultResponse} from '@contracts/idefault-response';
import {CrudServiceAdminLookupContract} from '@contracts/crud-service-admin-lookup-contract';
import {CastResponse, CastResponseContainer} from '@decorators/cast-response';
import {HasInterception, InterceptParam} from '@decorators/intercept-model';
import {Pagination} from '@app/models/pagination';
import {PaginationContract} from '@contracts/pagination-contract';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {IDialogData} from '@contracts/i-dialog-data';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {CommonUtils} from '@helpers/common-utils';

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

  private _emptyPaginationListResponse = of({
    rs: [],
    count: 0,
    sc: 200
  } as Pagination<AdminLookup[]>);

  adminLookupTypesWithChildren: AdminLookupTypeEnum[] = [
    AdminLookupTypeEnum.WORK_FIELD,
    AdminLookupTypeEnum.DAC,
    AdminLookupTypeEnum.OCHA,
    AdminLookupTypeEnum.GENERAL_PROCESS_CLASSIFICATION
  ];

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

  public getServiceURLByType(typeId: AdminLookupTypeEnum) {
    let url: string = this._getServiceURL();
    switch (typeId) {
      case AdminLookupTypeEnum.WORK_FIELD:
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
      case AdminLookupTypeEnum.EXIT_MECHANISM:
        url += '/exit-mechanism';
        break;
      case AdminLookupTypeEnum.PENALTIES_DECISION:
        url += '/penalties-decision';
        break;
      case AdminLookupTypeEnum.TEMPLATE_INDICATOR:
        url += '/template-indicator';
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
      case AdminLookupTypeEnum.GENERAL_PROCESS_CLASSIFICATION:
        url += '/general-process-classification';
        break;
      case AdminLookupTypeEnum.SERVICE_TYPE:
        url += '/service-type';
        break;
      case AdminLookupTypeEnum.FUNCTIONAL_GROUP:
        url += '/functional-group';
        break;
    }
    return url;
  }

  @CastResponse(() => AdminLookup, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _loadAdminLookupData(typeId: AdminLookupTypeEnum): Observable<AdminLookup[]> {
    if (!CommonUtils.isValidValue(typeId)) {
      return of([]);
    }
    return this.http.get<AdminLookup[]>(this.getServiceURLByType(typeId) + '/composite')
      .pipe((catchError((_) => of([]))));
  }

  load(typeId: AdminLookupTypeEnum): Observable<AdminLookup[]> {
    return this._loadAdminLookupData(typeId);
  }

  @CastResponse(() => AdminLookup, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _loadAdminLookupDataComposite(typeId: AdminLookupTypeEnum): Observable<AdminLookup[]> {
    if (!CommonUtils.isValidValue(typeId)) {
      return of([]);
    }
    return this.http.get<AdminLookup[]>(this.getServiceURLByType(typeId) + '/composite')
      .pipe((catchError((_) => of([]))));
  }

  loadComposite(typeId: AdminLookupTypeEnum): Observable<AdminLookup[]> {
    return this._loadAdminLookupDataComposite(typeId);
  }

  @CastResponse(() => AdminLookup, {
    unwrap: 'rs',
    fallback: '$default'
  })
  loadAsLookups(typeId: AdminLookupTypeEnum, hasActive = false) {
    if (!CommonUtils.isValidValue(typeId)) {
      return of([]);
    }
    return this.http.get<AdminLookup[]>(this.getServiceURLByType(typeId) + (hasActive ? '/active' : '') + '/lookup')
      .pipe((catchError((_) => of([]))));
  }

  @CastResponse(undefined, {
    fallback: '$pagination'
  })
  private _paginate(options: Partial<PaginationContract>, typeId: AdminLookupTypeEnum): Observable<Pagination<AdminLookup[]>> {
    return this.http.get<Pagination<AdminLookup[]>>(this.getServiceURLByType(typeId) + '/composite/pg', {
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
    return this.http.get<Pagination<AdminLookup[]>>(this.getServiceURLByType(typeId) + '/composite/pg', {
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
  private _loadByParent(typeId: AdminLookupTypeEnum, parentId: number): Observable<AdminLookup[]> {
    if (!parentId || !CommonUtils.isValidValue(typeId)) {
      return of([]);
    }
    return this.http.get<AdminLookup[]>(this.getServiceURLByType(typeId) + '/sub/' + parentId)
      .pipe((catchError((_) => of([]))));
  }

  loadByParentId(typeId: AdminLookupTypeEnum, parentId: number): Observable<AdminLookup[]> {
    return this._loadByParent(typeId, parentId);
  }

  @CastResponse(undefined, {
    fallback: '$pagination'
  })
  private _loadByParentIdPaging(options: Partial<PaginationContract>, typeId: AdminLookupTypeEnum, parentId: number): Observable<Pagination<AdminLookup[]>> {
    return this.http.get<Pagination<AdminLookup[]>>(this.getServiceURLByType(typeId) + '/sub/' + parentId, {
      params: options
    }).pipe((catchError((_) => {
      return this._emptyPaginationListResponse;
    })));
  }

  loadByParentIdPaging(options: Partial<PaginationContract>, typeId: AdminLookupTypeEnum, parentId: number): Observable<Pagination<AdminLookup[]>> {
    if (!parentId) {
      return this._emptyPaginationListResponse;
    }
    return this._loadByParentIdPaging(options, typeId, parentId);
  }

  @CastResponse(undefined, {
    fallback: '$pagination'
  })
  loadParentsPaging(options: Partial<PaginationContract>, typeId: AdminLookupTypeEnum): Observable<Pagination<AdminLookup[]>> {
    if (!CommonUtils.isValidValue(typeId)) {
      return this._emptyPaginationListResponse;
    }
    return this.http.get<Pagination<AdminLookup[]>>(this.getServiceURLByType(typeId) + '/main', {
      params: options
    }).pipe((catchError((_) => {
      return this._emptyPaginationListResponse;
    })));
  }

  @CastResponse(() => AdminLookup, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _loadWorkFieldsByType(typeId: AdminLookupTypeEnum) {
    if (!CommonUtils.isValidValue(typeId)) {
      return of([]);
    }
    return this.http.get<AdminLookup[]>(this.getServiceURLByType(typeId) + '/type/' + typeId)
      .pipe((catchError((_) => of([]))));
  }

  loadWorkFieldsByType(typeId: AdminLookupTypeEnum) {
    return this._loadWorkFieldsByType(typeId);
  }

  @CastResponse(undefined, {
    fallback: '$pagination'
  })
  private _loadWorkFieldsByTypePaging(options: Partial<PaginationContract>, typeId: AdminLookupTypeEnum): Observable<Pagination<AdminLookup[]>> {
    return this.http.get<Pagination<AdminLookup[]>>(this.getServiceURLByType(typeId) + '/type/' + typeId, {
      params: options
    }).pipe((catchError((_) => {
      return this._emptyPaginationListResponse;
    })));
  }

  loadWorkFieldsByTypePaging(options: Partial<PaginationContract>, typeId: AdminLookupTypeEnum): Observable<Pagination<AdminLookup[]>> {
    if (!CommonUtils.isValidValue(typeId)) {
      return this._emptyPaginationListResponse;
    }
    return this._loadWorkFieldsByTypePaging(options, typeId);
  }

  @CastResponse(undefined, {
    fallback: '$pagination'
  })
  loadWorkFieldsParentsByTypePaging(options: Partial<PaginationContract>, typeId: AdminLookupTypeEnum): Observable<Pagination<AdminLookup[]>> {
    if (!CommonUtils.isValidValue(typeId)) {
      return this._emptyPaginationListResponse;
    }
    return this.http.get<Pagination<AdminLookup[]>>(this.getServiceURLByType(typeId) + '/main/type/' + typeId, {
      params: options
    }).pipe((catchError((_) => {
      return this._emptyPaginationListResponse;
    })));
  }

  @CastResponse(() => AdminLookup, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _loadWorkFieldsByParent(parentId: number) {
    if (!parentId) {
      return of([]);
    }
    return this.http.get<AdminLookup[]>(this.getServiceURLByType(AdminLookupTypeEnum.WORK_FIELD) + '/sub/' + parentId)
      .pipe((catchError((_) => of([]))));
  }

  loadWorkFieldsByParent(parentId: number) {
    return this._loadWorkFieldsByParent(parentId);
  }

  @CastResponse(undefined, {
    fallback: '$pagination'
  })
  private _loadWorkFieldsByParentPaging(options: Partial<PaginationContract>, parentId: number): Observable<Pagination<AdminLookup[]>> {
    return this.http.get<Pagination<AdminLookup[]>>(this.getServiceURLByType(AdminLookupTypeEnum.WORK_FIELD) + '/sub/' + parentId, {
      params: options
    }).pipe((catchError((_) => {
      return this._emptyPaginationListResponse;
    })));
  }

  loadWorkFieldsByParentPaging(options: Partial<PaginationContract>, parentId: number): Observable<Pagination<AdminLookup[]>> {
    if (!parentId) {
      return this._emptyPaginationListResponse;
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
    return this.http.post<AdminLookup>(this.getServiceURLByType(model.type) + '/full', model);
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
    return this.http.delete<boolean>(this.getServiceURLByType(typeId) + '/' + modelId);
  }

  deleteBulk(modelIds: any[], typeId: AdminLookupTypeEnum): Observable<Record<number, boolean>> {
    return this.http.request<IDefaultResponse<Record<number, boolean>>>('delete', this.getServiceURLByType(typeId) + '/bulk', { body: modelIds })
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
    return this.http.put<any>(this.getServiceURLByType(typeId) + '/' + id + '/activate', {});
  }

  private _deactivate(id: number, typeId: AdminLookupTypeEnum): Observable<any> {
    return this.http.put<any>(this.getServiceURLByType(typeId) + '/' + id + '/de-activate', {});
  }

  private _activateBulk(recordIds: number[], typeId: AdminLookupTypeEnum) {
    return this.http.put(this.getServiceURLByType(typeId) + '/bulk/activate', recordIds)
      .pipe(
        map((response: any) => {
          return response.rs;
        })
      );
  }

  private _deactivateBulk(recordIds: number[], typeId: AdminLookupTypeEnum) {
    return this.http.put(this.getServiceURLByType(typeId) + '/bulk/de-activate', recordIds)
      .pipe(
        map((response: any) => {
          return response.rs;
        })
      );
  }

  openCreateDialog(typeId: AdminLookupTypeEnum, parentId?: number): DialogRef {
    return this.dialog.show<IDialogData<AdminLookup>>(this._getDialogComponent(), {
      model: new AdminLookup().clone({ type: typeId, parentId: parentId, status: CommonStatusEnum.ACTIVATED }),
      operation: OperationTypes.CREATE,
      selectedTab: 'basic',
      hasSubRecord: this.adminLookupTypesWithChildren.includes(typeId)
    });
  }

  openUpdateDialog(modelId: number, selectedPopupTab: string = 'basic'): Observable<DialogRef> {
    return this.getById(modelId).pipe(
      switchMap((item: AdminLookup) => {
        return of(this.dialog.show<IDialogData<AdminLookup>>(this._getDialogComponent(), {
          model: item,
          operation: OperationTypes.UPDATE,
          selectedTab: selectedPopupTab || 'basic',
          hasSubRecord: this.adminLookupTypesWithChildren.includes(item.type)
        }));
      })
    );
  }

  openViewDialog(modelId: number): Observable<DialogRef> {
    return this.getById(modelId).pipe(
      switchMap((item: AdminLookup) => {
        return of(this.dialog.show<IDialogData<AdminLookup>>(this._getDialogComponent(), {
          model: item,
          operation: OperationTypes.VIEW,
          selectedTab: 'basic',
          hasSubRecord: this.adminLookupTypesWithChildren.includes(item.type)
        }));
      })
    );
  }
}
