import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UrlService } from './url.service';
import { Observable, of } from 'rxjs';
import { CustomRole } from '../models/custom-role';
import { CustomRoleInterceptor } from '../model-interceptors/custom-role-interceptor';
import { FactoryService } from './factory.service';
import { DialogRef } from '../shared/models/dialog-ref';
import { DialogService } from './dialog.service';
import { switchMap } from 'rxjs/operators';
import { CustomRolePopupComponent } from '../administration/popups/custom-role-popup/custom-role-popup.component';
import { OperationTypes } from '../enums/operation-types.enum';
import { IDialogData } from '@contracts/i-dialog-data';
import { CustomRolePermissionService } from './custom-role-permission.service';
import { ComponentType } from '@angular/cdk/portal';
import { CastResponseContainer } from "@decorators/cast-response";
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";
import {Pagination} from '@app/models/pagination';

@CastResponseContainer({
  $default: {
    model: () => CustomRole,
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => CustomRole }
  }
})
@Injectable({
  providedIn: 'root'
})
export class ExternalUserCustomRoleService extends CrudWithDialogGenericService<CustomRole> {
  list!: CustomRole[];
  interceptor: CustomRoleInterceptor = new CustomRoleInterceptor();

  constructor(public http: HttpClient,
              private urlService: UrlService,
              private _customRolePermissionService: CustomRolePermissionService,
              public dialog: DialogService) {
    super();
    FactoryService.registerService('ExternalUserCustomRoleService', this);

  }

  _getDialogComponent(): ComponentType<any> {
    return CustomRolePopupComponent;
  }

  _getModel(): any {
    return CustomRole;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.EXTERNAL_USER_CUSTOM_ROLE;
  }

  addDialog(): DialogRef {
    return this.dialog.show<IDialogData<CustomRole>>(CustomRolePopupComponent, {
      model: new CustomRole(),
      operation: OperationTypes.CREATE,
      customRolePermissions: []
    });
  }

  editDialog(model: CustomRole): Observable<DialogRef> {
    return this._openUpdateDialog(model.id, false);
  }

  editDialogComposite(model: CustomRole): Observable<DialogRef> {
    return this._openUpdateDialog(model.id, true);
  }

  private _openUpdateDialog(modelId: number, isCompositeLoad: boolean): Observable<DialogRef> {
    let request = isCompositeLoad ? this.getByIdComposite(modelId) : this.getById(modelId);
    return request
      .pipe(switchMap((role) => {
        return of(this.dialog.show<IDialogData<CustomRole>>(CustomRolePopupComponent, {
          model: role,
          operation: OperationTypes.UPDATE,
          customRolePermissions: role.permissionSet
        }));
      }));
  }
  activate(id: number) {
    return this.http.put(this._getServiceURL() + `/${id}/activate`, {});
  }

  deActivate(id: number) {
    return this.http.put(this._getServiceURL() + `/${id}/de-activate`, {});
  }

}
