import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {DialogService} from '@services/dialog.service';
import {Injectable} from '@angular/core';
import {EmployeeService} from '@services/employee.service';
import {LangService} from '@services/lang.service';
import {CommonUtils} from '@app/helpers/common-utils';
import {PermissionGroupsEnum} from '@app/enums/permission-groups-enum';
import {StaticAppResourcesService} from '@services/static-app-resources.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionOldGuard implements CanActivate {
  constructor(private empService: EmployeeService,
              private dialogService: DialogService,
              private langService: LangService,
              private staticResourcesService: StaticAppResourcesService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | boolean {
    let permissionKey: string | string[] = route.data.permissionKey,
      permissionGroup: string = route.data.configPermissionGroup,
      checkAnyPermission: boolean = route.data.checkAnyPermission,
      permissions: string | string[] = '';
    if (CommonUtils.isValidValue(permissionGroup)) {
      permissions = this.staticResourcesService.getPermissionsListByGroup(permissionGroup as unknown as PermissionGroupsEnum) || '';
    }
    if (CommonUtils.isValidValue(permissionKey)) {
      if (typeof permissionKey === 'string') {
        permissions = permissionKey;
        checkAnyPermission = false;
      } else {
        permissions = (permissionKey.length > 0) ? permissionKey : '';
      }
    }
    const hasPermission = this.empService.checkPermissions(permissions, checkAnyPermission);
    if (!hasPermission) {
      this.dialogService.info(this.langService.map.access_denied);
    }
    return hasPermission;
  }
}
