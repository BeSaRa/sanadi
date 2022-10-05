import { MenuSubListItemPopupComponent } from './../administration/popups/menu-sub-list-item-popup/menu-sub-list-item-popup.component';
import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CastResponse, CastResponseContainer } from '@app/decorators/decorators/cast-response';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { MenuItemListInterceptor } from '@app/model-interceptors/menu-item-list-interceptor';
import { Pagination } from '@app/models/pagination';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { MenuItemListPopupComponent } from './../administration/popups/menu-item-list-popup/menu-item-list-popup.component';
import { MenuItemList } from './../models/menu-item-list';
import { AdminLookupService } from './admin-lookup.service';
import { DialogService } from './dialog.service';
import { FactoryService } from './factory.service';
import { UrlService } from './url.service';

@CastResponseContainer({
  $default: {
    model: () => MenuItemList,
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => MenuItemList },
  },
})
@Injectable({
  providedIn: 'root',
})
export class MenuItemListService extends CrudWithDialogGenericService<MenuItemList> {
  _getDialogComponent(): ComponentType<any> {
    return MenuItemListPopupComponent;
  }

  _getModel(): new () => MenuItemList {
    return MenuItemList;
  }
  list: MenuItemList[] = [];
  _getServiceURL(): string {
    return this.urlService.URLS.MENU_ITEM_LIST;
  }
  private _getSubListComponent(){
    return MenuSubListItemPopupComponent;
  }

  constructor(
    public dialog: DialogService,
    public http: HttpClient,
    private urlService: UrlService,
    private adminLookupService: AdminLookupService,
  ) {
    super();
    FactoryService.registerService('MenuItemListService', this);
  }
  openCreateDialog(model:MenuItemList): DialogRef {
    return this.dialog.show<IDialogData<MenuItemList>>(this._getSubListComponent(), {
      model: new MenuItemList().clone({parentMenuItemId:model.id}),
      operation: OperationTypes.CREATE,

    });
  }
  openViewDialog(model: MenuItemList): Observable<DialogRef> {
    return of(
      this.dialog.show<IDialogData<MenuItemList>>(this._getDialogComponent(), {
        model,
        operation: OperationTypes.VIEW,
      })
    );
  }
  openEditDialog(model: MenuItemList): Observable<DialogRef> {
    return of(
      this.dialog.show<IDialogData<MenuItemList>>(this._getDialogComponent(), {
        model,
        operation: OperationTypes.UPDATE,
      })
    );
  }
  openSubListViewDialog(model: MenuItemList): Observable<DialogRef> {
    return of(
      this.dialog.show<IDialogData<MenuItemList>>(this._getSubListComponent(), {
        model,
        operation: OperationTypes.VIEW,
      })
    );
  }
  openSubListEditDialog(model: MenuItemList): Observable<DialogRef> {
    return of(
      this.dialog.show<IDialogData<MenuItemList>>(this._getSubListComponent(), {
        model,
        operation: OperationTypes.UPDATE,
      })
    );
  }
  updateStatus(recordId: number, newStatus: CommonStatusEnum) {
    return newStatus === CommonStatusEnum.ACTIVATED
      ? this._activate(recordId)
      : this._deactivate(recordId);
  }

  updateStatusBulk(
    recordIds: number[],
    newStatus: CommonStatusEnum
  ): Observable<any> {
    return newStatus === CommonStatusEnum.ACTIVATED
      ? this._activateBulk(recordIds)
      : this._deactivateBulk(recordIds);
  }

  private _activate(recordId: number): Observable<any> {
    return this.http.put<any>(
      this._getServiceURL() + '/' + recordId + '/activate',
      {}
    );
  }

  private _deactivate(recordId: number): Observable<any> {
    return this.http.put<any>(
      this._getServiceURL() + '/' + recordId + '/de-activate',
      {}
    );
  }

  private _activateBulk(recordIds: number[]) {
    return this.http
      .put(this._getServiceURL() + '/bulk/activate', recordIds)
      .pipe(
        map((response: any) => {
          return response.rs;
        })
      );
  }

  private _deactivateBulk(recordIds: number[]) {
    return this.http
      .put(this._getServiceURL() + '/bulk/de-activate', recordIds)
      .pipe(
        map((response: any) => {
          return response.rs;
        })
      );
  }
  @CastResponse(() => MenuItemList, {
    fallback: '$default',
    unwrap: 'rs'
  })
  loadByParentIdPaging( parentId: number): Observable<MenuItemList[]> {
    return this.http
    .post<MenuItemList[]>(this._getServiceURL() + '/filter',{
      parentMenuItemId: parentId
    })
  }
  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _loadMain(): Observable<MenuItemList[]> {
    return this.http.get<MenuItemList[]>(this._getServiceURL()+ '/main');
  }
  load(prepare?: boolean): Observable<MenuItemList[]> {
    return this._loadMain()
      .pipe(
        tap(result => this.list = result),
        tap(result => this._loadDone$.next(result))
      );
  }
}
