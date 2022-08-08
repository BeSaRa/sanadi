import {Injectable} from '@angular/core';
import {BackendWithDialogOperationsGenericService} from '@app/generics/backend-with-dialog-operations-generic-service';
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
import {AdminLookupInterceptor} from '@app/model-interceptors/admin-lookup-interceptor';
import {DacOchaNewPopupComponent} from '@app/administration/popups/dac-ocha-new-popup/dac-ocha-new-popup.component';
import {PaginationContract} from '@contracts/pagination-contract';
import {Pagination} from '@app/models/pagination';

@Injectable({
  providedIn: 'root'
})
export class DacOchaNewService extends BackendWithDialogOperationsGenericService<AdminLookup> {
  list: AdminLookup[] = [];
  interceptor: AdminLookupInterceptor = new AdminLookupInterceptor();

  constructor(public http: HttpClient,
              private urlService: UrlService,
              private adminLookupService: AdminLookupService,
              public dialog: DialogService) {
    super();
    FactoryService.registerService('DacOchaNewService', this);
  }

  _getModel(): any {
    return AdminLookup;
  }

  _getDialogComponent(): ComponentType<any> {
    return DacOchaNewPopupComponent;
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

  load() {
    return this.adminLookupService.loadComposite(AdminLookupTypeEnum.DAC_OCHA);
  }

  loadComposite() {
    return this.adminLookupService.loadComposite(AdminLookupTypeEnum.DAC_OCHA);
  }

  loadByType(dacOchaTypeId: AdminLookupTypeEnum) {
    return this.adminLookupService.loadWorkFieldsByType(dacOchaTypeId);
  }

  loadByTypePaging(options: Partial<PaginationContract>, dacOchaTypeId: AdminLookupTypeEnum): Observable<Pagination<AdminLookup[]>> {
    return this.adminLookupService.loadWorkFieldsByTypePaging(options,  dacOchaTypeId);
  }

  loadByParentId(parentId: number) {
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

  openUpdateDialog(modelId: number, selectedPopupTab: string = 'basic'): Observable<DialogRef> {
    return this.getById(modelId).pipe(
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
