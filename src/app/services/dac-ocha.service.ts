import {CastResponse} from '@decorators/cast-response';
import {Injectable} from '@angular/core';
import {FactoryService} from '@services/factory.service';
import {AdminLookupTypeEnum} from '@app/enums/admin-lookup-type-enum';
import {HttpClient} from '@angular/common/http';
import {UrlService} from '@services/url.service';
import {DialogService} from '@services/dialog.service';
import {AdminLookupService} from '@services/admin-lookup.service';
import {ComponentType} from '@angular/cdk/portal';
import {AdminLookup} from '@app/models/admin-lookup';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {IDialogData} from '@contracts/i-dialog-data';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {DacOchaNewPopupComponent} from '@app/administration/popups/dac-ocha-new-popup/dac-ocha-new-popup.component';
import {PaginationContract} from '@contracts/pagination-contract';
import {Pagination} from '@app/models/pagination';
import {CrudWithDialogGenericService} from "@app/generics/crud-with-dialog-generic-service";

@Injectable({
  providedIn: 'root'
})
export class DacOchaService extends CrudWithDialogGenericService<AdminLookup> {
  list: AdminLookup[] = [];

  constructor(public http: HttpClient,
              private urlService: UrlService,
              private adminLookupService: AdminLookupService,
              public dialog: DialogService) {
    super();
    FactoryService.registerService('DacOchaService', this);
  }

  _getModel(): any {
    return AdminLookup;
  }

  _getDialogComponent(): ComponentType<any> {
    return DacOchaNewPopupComponent;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.ADMIN_LOOKUP;
  }

  load() {
    return this.adminLookupService.loadComposite(AdminLookupTypeEnum.WORK_FIELD);
  }

  loadComposite() {
    return this.adminLookupService.loadComposite(AdminLookupTypeEnum.WORK_FIELD);
  }

  loadAsLookups(): Observable<AdminLookup[]> {
    return this.adminLookupService.loadAsLookups(AdminLookupTypeEnum.WORK_FIELD);
  }
  loadMainDacOcha(): Observable<AdminLookup[]> {
    return this.adminLookupService.LoadMainWorkField();
  }

  loadByType(dacOchaTypeId: AdminLookupTypeEnum) {
    return this.adminLookupService.loadWorkFieldsByType(dacOchaTypeId);
  }

  loadByTypePaging(options: Partial<PaginationContract>, dacOchaTypeId: AdminLookupTypeEnum): Observable<Pagination<AdminLookup[]>> {
    return this.adminLookupService.loadWorkFieldsByTypePaging(options, dacOchaTypeId);
  }

  paginateByTypeFilter(options: Partial<PaginationContract>, typeId: AdminLookupTypeEnum, filterModel: Partial<AdminLookup>): Observable<Pagination<AdminLookup[]>> {
    return this.adminLookupService.loadWorkFieldsByFilterPaging(options, typeId, filterModel);
  }

  loadByTypeFilter(dacOchaTypeId: AdminLookupTypeEnum, filterModel: Partial<AdminLookup>): Observable<AdminLookup[]> {
    return this.adminLookupService.loadWorkFieldsByFilter(dacOchaTypeId, filterModel);
  }

  loadParentsByTypePaging(options: Partial<PaginationContract>, dacOchaTypeId: AdminLookupTypeEnum): Observable<Pagination<AdminLookup[]>> {
    return this.adminLookupService.loadWorkFieldsParentsByTypePaging(options, dacOchaTypeId);
  }

  loadByParentId(parentId: number): Observable<AdminLookup[]> {
    if (!parentId) {
      return of([]);
    }
    return this.adminLookupService.loadWorkFieldsByParent(parentId);
  }

  loadByParentIdPaging(options: Partial<PaginationContract>, parentId: number): Observable<Pagination<AdminLookup[]>> {
    return this.adminLookupService.loadWorkFieldsByParentPaging(options, parentId);
  }

  openCreateDialog(typeId: AdminLookupTypeEnum, parentId?: number): DialogRef {
    return this.dialog.show<IDialogData<AdminLookup>>(DacOchaNewPopupComponent, {
      model: new AdminLookup().clone({type: typeId, parentId: parentId}),
      operation: OperationTypes.CREATE,
      selectedTab: 'basic'
    });
  }

  @CastResponse(() => AdminLookup)
  private _getByIdCasted(modelId: number) {
    return this.getById(modelId);
  }

  openViewDialog(modelId: number, selectedPopupTab: string = 'basic'): Observable<DialogRef> {
    return this._getByIdCasted(modelId).pipe(
      switchMap((item: AdminLookup) => {
        return of(this.dialog.show<IDialogData<AdminLookup>>(DacOchaNewPopupComponent, {
          model: item,
          operation: OperationTypes.VIEW,
          selectedTab: selectedPopupTab || 'basic'
        }));
      })
    );
  }

  openUpdateDialog(modelId: number, selectedPopupTab: string = 'basic'): Observable<DialogRef> {
    return this._getByIdCasted(modelId).pipe(
      switchMap((item: AdminLookup) => {
        return of(this.dialog.show<IDialogData<AdminLookup>>(DacOchaNewPopupComponent, {
          model: item,
          operation: OperationTypes.UPDATE,
          selectedTab: selectedPopupTab || 'basic'
        }));
      })
    );
  }
}
