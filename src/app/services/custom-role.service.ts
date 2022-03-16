import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UrlService} from './url.service';
import {Observable, of, Subject} from 'rxjs';
import {CustomRole} from '../models/custom-role';
import {CustomRoleInterceptor} from '../model-interceptors/custom-role-interceptor';
import {FactoryService} from './factory.service';
import {DialogRef} from '../shared/models/dialog-ref';
import {DialogService} from './dialog.service';
import {switchMap} from 'rxjs/operators';
import {CustomRolePopupComponent} from '../administration/popups/custom-role-popup/custom-role-popup.component';
import {OperationTypes} from '../enums/operation-types.enum';
import {IDialogData} from '../interfaces/i-dialog-data';
import {BackendGenericService} from '../generics/backend-generic-service';
import {CustomRolePermissionService} from './custom-role-permission.service';
import {BackendWithDialogOperationsGenericService} from '@app/generics/backend-with-dialog-operations-generic-service';
import {ComponentType} from '@angular/cdk/portal';

@Injectable({
  providedIn: 'root'
})
export class CustomRoleService extends BackendWithDialogOperationsGenericService<CustomRole> {
  list!: CustomRole[];
  interceptor: CustomRoleInterceptor = new CustomRoleInterceptor();

  constructor(public http: HttpClient,
              private urlService: UrlService,
              private customRolePermissionService: CustomRolePermissionService,
              public dialog: DialogService) {
    super();
    FactoryService.registerService('CustomRoleService', this);

  }

  _getDialogComponent(): ComponentType<any> {
    return CustomRolePopupComponent;
  }

  _getModel(): any {
    return CustomRole;
  }

  _getSendInterceptor(): any {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.CUSTOM_ROLE;
  }

  _getReceiveInterceptor(): any {
    return this.interceptor.receive;
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
}
