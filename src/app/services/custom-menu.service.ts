import {ComponentType} from '@angular/cdk/portal';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {CastResponse, CastResponseContainer} from '@app/decorators/decorators/cast-response';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {CrudWithDialogGenericService} from '@app/generics/crud-with-dialog-generic-service';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {Pagination} from '@app/models/pagination';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {Observable, of} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import {CustomMenuPopupComponent} from '../administration/popups/custom-menu-popup/custom-menu-popup.component';
import {CustomMenu} from '../models/custom-menu';
import {DialogService} from './dialog.service';
import {FactoryService} from './factory.service';
import {UrlService} from './url.service';
import {PaginationContract} from '@contracts/pagination-contract';

@CastResponseContainer({
  $default: {
    model: () => CustomMenu,
  },
  $pagination: {
    model: () => Pagination,
    shape: {'rs.*': () => CustomMenu},
  },
})
@Injectable({
  providedIn: 'root',
})
export class CustomMenuService extends CrudWithDialogGenericService<CustomMenu> {
  list: CustomMenu[] = [];

  constructor(public dialog: DialogService,
              public http: HttpClient,
              private urlService: UrlService) {
    super();
    FactoryService.registerService('CustomMenuService', this);
  }

  _getDialogComponent(): ComponentType<any> {
    return CustomMenuPopupComponent;
  }

  _getModel(): new () => CustomMenu {
    return CustomMenu;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.MENU_ITEM_LIST;
  }

  @CastResponse(undefined, {
    fallback: '$pagination'
  })
  private _loadMain(options: Partial<PaginationContract>): Observable<Pagination<CustomMenu[]>> {
    return this.http.get<Pagination<CustomMenu[]>>(this._getServiceURL() + '/main', {
      params: { ...options }
    });
  }

  loadMain(options: Partial<PaginationContract>): Observable<Pagination<CustomMenu[]>> {
    return this._loadMain(options);
  }

  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  loadByParentId(parentId: number): Observable<CustomMenu[]> {
    return this.http.post<CustomMenu[]>(this._getServiceURL() + '/filter', {
      parentMenuItemId: parentId
    });
  }

  openCreateDialog(parentId?: number): DialogRef {
    return this.dialog.show<IDialogData<CustomMenu>>(this._getDialogComponent(), {
      model: new CustomMenu().clone({parentMenuItemId: parentId}),
      operation: OperationTypes.CREATE
    });
  }

  openEditDialog(modelId: number, selectedPopupTab: string = 'basic'): Observable<DialogRef> {
    return this.getById(modelId).pipe(
      switchMap((item: CustomMenu) => {
        return of(this.dialog.show<IDialogData<CustomMenu>>(this._getDialogComponent(), {
          model: item,
          operation: OperationTypes.UPDATE,
          selectedTab: selectedPopupTab || 'basic'
        }));
      })
    );
  }

  openViewDialog(modelId: number, selectedPopupTab: string = 'basic'): Observable<DialogRef> {
    return this.getById(modelId).pipe(
      switchMap((item: CustomMenu) => {
        return of(this.dialog.show<IDialogData<CustomMenu>>(this._getDialogComponent(), {
          model: item,
          operation: OperationTypes.VIEW,
          selectedTab: selectedPopupTab || 'basic'
        }));
      })
    );
  }

  updateStatus(recordId: number, newStatus: CommonStatusEnum) {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activate(recordId) : this._deactivate(recordId);
  }

  updateStatusBulk(recordIds: number[], newStatus: CommonStatusEnum): Observable<any> {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activateBulk(recordIds) : this._deactivateBulk(recordIds);
  }

  private _activate(recordId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + recordId + '/activate', {});
  }

  private _deactivate(recordId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + recordId + '/de-activate', {});
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

  @CastResponse(() => CustomMenu, {
    fallback: '$default',
    unwrap: 'rs'
  })
  loadMenuTree(): Observable<CustomMenu[]> {
    return this.http.get<CustomMenu[]>(this._getServiceURL() + '/tree');
  }
}
