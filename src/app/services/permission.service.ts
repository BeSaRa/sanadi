import {
  AdminPermissionPopupComponent
} from './../administration/popups/admin-permission-popup/admin-permission-popup.component';
import {Injectable} from '@angular/core';
import {Permission} from '../models/permission';
import {HttpClient} from '@angular/common/http';
import {UrlService} from './url.service';
import {FactoryService} from './factory.service';
import {Pagination} from '@app/models/pagination';
import {CastResponse, CastResponseContainer} from "@decorators/cast-response";
import {CrudWithDialogGenericService} from '@app/generics/crud-with-dialog-generic-service';
import {ComponentType} from '@angular/cdk/portal';
import {DialogService} from './dialog.service';
import {Observable, of} from 'rxjs';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {map, switchMap} from 'rxjs/operators';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {PermissionsEnum} from "@enums/permissions-enum";

@CastResponseContainer({
  $default: {
    model: () => Permission
  },
  $pagination: {
    model: () => Pagination,
    shape: {'rs.*': () => Permission}
  }
})
@Injectable({
  providedIn: 'root'
})
export class PermissionService extends CrudWithDialogGenericService<Permission> {
  _getDialogComponent(): ComponentType<any> {
    return AdminPermissionPopupComponent;
  }

  list!: Permission[];

  constructor(public http: HttpClient, private urlService: UrlService, public dialog: DialogService) {
    super();
    FactoryService.registerService('PermissionService', this);
  }

  _getModel(): any {
    return Permission;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.PERMISSIONS;
  }

  @CastResponse(() => Permission, {
    unwrap: 'rs',
    fallback: '$default'
  })
  private _loadAsLookups(): Observable<Permission[]> {
    return this.http.get<Permission[]>(this._getServiceURL() + '/lookup')
  }

  loadAsLookups(): Observable<Permission[]> {
    return this._loadAsLookups()
      .pipe(
        map((result) => {
          return result.filter((permission) => permission.permissionKey !== PermissionsEnum.MANAGE_PERMISSIONS);
        })
      );
  }

  openViewDialog(modelId: number): Observable<DialogRef> {
    return this.getByIdComposite(modelId).pipe(
      switchMap((permission: Permission) => {
        return of(this.dialog.show<IDialogData<Permission>>(AdminPermissionPopupComponent, {
          model: permission,
          operation: OperationTypes.VIEW
        }));
      })
    );
  }
}
