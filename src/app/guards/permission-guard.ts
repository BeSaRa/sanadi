import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {DialogService} from '../services/dialog.service';
import {Injectable} from '@angular/core';
import {EmployeeService} from '../services/employee.service';
import {LangService} from '../services/lang.service';
import {ConfigurationService} from '../services/configuration.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionGuard implements CanActivate {
  constructor(private empService: EmployeeService,
              private dialogService: DialogService,
              private langService: LangService,
              private configService: ConfigurationService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | boolean {
    let permissions: string | string[] = route.data.permissionKey;
    if (!!route.data.configPermissionGroup) {
      // @ts-ignore
      permissions = this.configService.CONFIG[route.data.configPermissionGroup] || '';
    }
    const hasPermission = this.empService.checkPermissions(permissions, route.data.checkAnyPermission);
    if (!hasPermission) {
      this.dialogService.info(this.langService.map.access_denied);
    }
    return hasPermission;
  }
}
