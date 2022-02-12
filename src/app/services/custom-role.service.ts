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

@Injectable({
  providedIn: 'root'
})
export class CustomRoleService extends BackendGenericService<CustomRole> {
  list!: CustomRole[];
  _loadDone$!: Subject<CustomRole[]>;

  constructor(public http: HttpClient,
              private urlService: UrlService,
              private customRolePermissionService: CustomRolePermissionService,
              private  dialogService: DialogService) {
    super();
    FactoryService.registerService('CustomRoleService', this);

  }


  openCreateDialog(): DialogRef {
    return this.dialogService.show<IDialogData<CustomRole>>(CustomRolePopupComponent, {
      model: new CustomRole(),
      operation: OperationTypes.CREATE,
      customRolePermissions: []
    });
  }

  openUpdateDialog(modelId: number): Observable<DialogRef> {
    return this.getById(modelId)
      .pipe(switchMap((role) => {
        return of(this.dialogService.show<IDialogData<CustomRole>>(CustomRolePopupComponent, {
          model: role,
          operation: OperationTypes.UPDATE,
          customRolePermissions: role.permissionSet
        }));
      }));
  }

  _getModel(): any {
    return CustomRole;
  }

  _getSendInterceptor(): any {
    return CustomRoleInterceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.CUSTOM_ROLE;
  }

  _getReceiveInterceptor(): any {
    return CustomRoleInterceptor.receive;
  }
}
