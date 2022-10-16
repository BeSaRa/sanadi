import { CustomSubMenuPopupComponent } from '../administration/popups/custom-sub-menu-popup/custom-sub-menu-popup.component';
import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CastResponse, CastResponseContainer } from '@app/decorators/decorators/cast-response';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { CustomMenuInterceptor } from '@app/model-interceptors/custom-menu-interceptor';
import { Pagination } from '@app/models/pagination';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CustomMenuPopupComponent } from '../administration/popups/custom-menu-popup/custom-menu-popup.component';
import { CustomMenu } from '../models/custom-menu';
import { AdminLookupService } from './admin-lookup.service';
import { DialogService } from './dialog.service';
import { FactoryService } from './factory.service';
import { UrlService } from './url.service';

@CastResponseContainer({
  $default: {
    model: () => CustomMenu,
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => CustomMenu },
  },
})
@Injectable({
  providedIn: 'root',
})
export class CustomMenuService extends CrudWithDialogGenericService<CustomMenu> {
  _getDialogComponent(): ComponentType<any> {
    return CustomMenuPopupComponent;
  }

  _getModel(): new () => CustomMenu {
    return CustomMenu;
  }
  list: CustomMenu[] = [];
  _getServiceURL(): string {
    return this.urlService.URLS.MENU_ITEM_LIST;
  }
  private _getSubListComponent(){
    return CustomSubMenuPopupComponent;
  }

  constructor(
    public dialog: DialogService,
    public http: HttpClient,
    private urlService: UrlService,
    private adminLookupService: AdminLookupService,
  ) {
    super();
    FactoryService.registerService('CustomMenuService', this);
  }
  openCreateDialog(id:number): DialogRef {
    return this.dialog.show<IDialogData<CustomMenu>>(this._getSubListComponent(), {
      model: new CustomMenu().clone({parentMenuItemId:id}),
      operation: OperationTypes.CREATE,

    });
  }
  openViewDialog(model: CustomMenu): Observable<DialogRef> {
    return of(
      this.dialog.show<IDialogData<CustomMenu>>(this._getDialogComponent(), {
        model,
        operation: OperationTypes.VIEW,
      })
    );
  }
  openEditDialog(model: CustomMenu, selectedPopupTab: string = 'basic'): Observable<DialogRef> {
    return of(
      this.dialog.show<IDialogData<CustomMenu>>(this._getDialogComponent(), {
        model,
        operation: OperationTypes.UPDATE,
        selectedTab: selectedPopupTab || 'basic'
      })
    );
  }
  openSubListViewDialog(model: CustomMenu): Observable<DialogRef> {
    return of(
      this.dialog.show<IDialogData<CustomMenu>>(this._getSubListComponent(), {
        model,
        operation: OperationTypes.VIEW,
      })
    );
  }
  openSubListEditDialog(model: CustomMenu): Observable<DialogRef> {
    return of(
      this.dialog.show<IDialogData<CustomMenu>>(this._getSubListComponent(), {
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
  @CastResponse(() => CustomMenu, {
    fallback: '$default',
    unwrap: 'rs'
  })
  loadByParentIdPaging( parentId: number): Observable<CustomMenu[]> {
    return this.http
    .post<CustomMenu[]>(this._getServiceURL() + '/filter',{
      parentMenuItemId: parentId
    })
  }
  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _loadMain(): Observable<CustomMenu[]> {
    return this.http.get<CustomMenu[]>(this._getServiceURL()+ '/main');
  }
  load(prepare?: boolean): Observable<CustomMenu[]> {
    return this._loadMain()
      .pipe(
        tap(result => this.list = result),
        tap(result => this._loadDone$.next(result))
      );
  }
}
